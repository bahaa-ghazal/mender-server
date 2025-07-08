// Copyright 2025 Northern.tech AS
//
//	Licensed under the Apache License, Version 2.0 (the "License");
//	you may not use this file except in compliance with the License.
//	You may obtain a copy of the License at
//
//	    http://www.apache.org/licenses/LICENSE-2.0
//
//	Unless required by applicable law or agreed to in writing, software
//	distributed under the License is distributed on an "AS IS" BASIS,
//	WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//	See the License for the specific language governing permissions and
//	limitations under the License.

package ratelimits

import (
	"fmt"
	"time"

	"github.com/mendersoftware/mender-server/pkg/config"
	"github.com/mendersoftware/mender-server/pkg/log"
	"github.com/mendersoftware/mender-server/pkg/rate"
	"github.com/mendersoftware/mender-server/pkg/redis"
)

type ConfigDisabledError struct {
	Path string
}

func (err *ConfigDisabledError) Error() string {
	return `configuration "` + err.Path + `" disabled`
}

func init() {
	config.Config.SetDefault(SettingRatelimitsAuthDefaultInterval, "1m")
	config.Config.SetDefault(SettingRatelimitsAuthDefaultQuota, "120")
	config.Config.SetDefault(SettingRatelimitsAuthDefaultEventExpression,
		"{{with .Identity}}{{.Subject}}{{end}}")
}

const (
	SettingRatelimits                           = "ratelimits"
	SettingRatelimitsAuth                       = SettingRatelimits + ".auth"
	SettingRatelimitsAuthEnable                 = SettingRatelimitsAuth + ".enable"
	SettingRatelimitsAuthGroups                 = SettingRatelimitsAuth + ".groups"
	SettingRatelimitsAuthMatch                  = SettingRatelimitsAuth + ".match"
	SettingRatelimitsAuthDefault                = SettingRatelimitsAuth + ".default"
	SettingRatelimitsAuthDefaultQuota           = SettingRatelimitsAuthDefault + ".quota"
	SettingRatelimitsAuthDefaultInterval        = SettingRatelimitsAuthDefault + ".interval"
	SettingRatelimitsAuthDefaultEventExpression = SettingRatelimitsAuthDefault +
		".event_expression"
)

func LoadRatelimits(c config.Reader) (*RatelimitConfig, error) {
	if !c.GetBool(SettingRatelimitsAuthEnable) {
		return nil, nil
	}
	ratelimitConfig := RatelimitConfig{
		DefaultGroup: RatelimitParams{
			Quota:           int64(c.GetInt(SettingRatelimitsAuthDefaultQuota)),
			Interval:        config.Duration(c.GetDuration(SettingRatelimitsAuthDefaultInterval)),
			EventExpression: c.GetString(SettingRatelimitsAuthDefaultEventExpression),
		},
	}
	err := config.UnmarshalSliceSetting(c,
		SettingRatelimitsAuthGroups,
		&ratelimitConfig.RatelimitGroups,
	)
	if err != nil {
		return nil, fmt.Errorf("error loading rate limit groups: %w", err)
	}

	err = config.UnmarshalSliceSetting(c,
		SettingRatelimitsAuthMatch,
		&ratelimitConfig.MatchExpressions,
	)
	if err != nil {
		return nil, fmt.Errorf("error loading rate limit match expressions: %w", err)
	}
	return &ratelimitConfig, nil
}

func SetupRedisRateLimits(
	redisClient redis.Client,
	keyPrefix string,
	c config.Reader,
) (*rate.HTTPLimiter, error) {
	if !c.GetBool(SettingRatelimitsAuthEnable) {
		return nil, &ConfigDisabledError{
			Path: SettingRatelimitsAuthEnable,
		}
	}
	lims, err := LoadRatelimits(c)
	if err != nil {
		return nil, err
	}
	log.NewEmpty().Debugf("loaded rate limit configuration: %v", lims)
	defaultPrefix := fmt.Sprintf("%s:rate:default", keyPrefix)
	defaultLimiter := redis.NewFixedWindowRateLimiter(
		redisClient, defaultPrefix,
		time.Duration(lims.DefaultGroup.Interval), lims.DefaultGroup.Quota,
	)
	mux, err := rate.NewHTTPLimiter(
		defaultLimiter,
		c.GetString(SettingRatelimitsAuthDefaultEventExpression),
	)
	if err != nil {
		return nil, fmt.Errorf("error setting up rate limits: %w", err)
	}
	for _, group := range lims.RatelimitGroups {
		groupPrefix := fmt.Sprintf("%s:rate:g:%s", keyPrefix, group.Name)
		limiter := redis.NewFixedWindowRateLimiter(
			redisClient, groupPrefix, time.Duration(group.Interval), group.Quota,
		)
		err = mux.AddRateLimitGroup(limiter, group.Name, group.EventExpression)
		if err != nil {
			return nil, fmt.Errorf("error setting up rate limit group %s: %w", group.Name, err)
		}
	}
	for _, expr := range lims.MatchExpressions {
		err = mux.AddMatchExpression(expr.APIPattern, expr.GroupExpression)
		if err != nil {
			return nil, fmt.Errorf("error setting up match patterns: %w", err)
		}
	}
	return mux, nil
}
