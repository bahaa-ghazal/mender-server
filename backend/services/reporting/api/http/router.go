// Copyright 2023 Northern.tech AS
//
//    Licensed under the Apache License, Version 2.0 (the "License");
//    you may not use this file except in compliance with the License.
//    You may obtain a copy of the License at
//
//        http://www.apache.org/licenses/LICENSE-2.0
//
//    Unless required by applicable law or agreed to in writing, software
//    distributed under the License is distributed on an "AS IS" BASIS,
//    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//    See the License for the specific language governing permissions and
//    limitations under the License.

package http

import (
	"github.com/gin-gonic/gin"

	"github.com/mendersoftware/mender-server/pkg/identity"
	"github.com/mendersoftware/mender-server/pkg/rbac"
	"github.com/mendersoftware/mender-server/pkg/requestsize"
	"github.com/mendersoftware/mender-server/pkg/routing"

	"github.com/mendersoftware/mender-server/services/reporting/app/reporting"
	dconfig "github.com/mendersoftware/mender-server/services/reporting/config"
)

// API URL used by the HTTP router
const (
	URIInternal   = "/api/internal/v1/reporting"
	URIManagement = "/api/management/v1/reporting"

	URIAlive                   = "/alive"
	URIHealth                  = "/health"
	URIDeploymentsAggregate    = "/deployments/devices/aggregate"
	URIDeploymentsSearch       = "/deployments/devices/search"
	URIInventoryAggregate      = "/devices/aggregate"
	URIInventoryAttrs          = "/devices/attributes"
	URIInventorySearch         = "/devices/search"
	URIInventorySearchAttrs    = "/devices/search/attributes"
	URIInventorySearchInternal = "/tenants/:tenant_id/devices/search"
)

type Config struct {
	MaxRequestSize int64
}

func NewConfig() *Config {
	return &Config{
		MaxRequestSize: dconfig.SettingMaxRequestSizeDefault,
	}
}

type Option func(c *Config)

func SetMaxRequestSize(size int64) Option {
	return func(c *Config) {
		c.MaxRequestSize = size
	}
}

// NewRouter returns the gin router
func NewRouter(reporting reporting.App, options ...Option) *gin.Engine {
	config := NewConfig()
	for _, option := range options {
		if option != nil {
			option(config)
		}
	}

	router := routing.NewGinRouter()
	router.Use(requestsize.Middleware(config.MaxRequestSize))

	internal := NewInternalController(reporting)
	internalAPI := router.Group(URIInternal)
	internalAPI.GET(URIAlive, internal.Alive)
	internalAPI.GET(URIHealth, internal.Health)
	internalAPI.POST(URIInventorySearchInternal, internal.SearchDevices)

	mgmt := NewManagementController(reporting)
	mgmtAPI := router.Group(URIManagement)
	mgmtAPI.Use(identity.Middleware())
	mgmtAPI.Use(rbac.Middleware())
	// devices
	mgmtAPI.POST(URIInventoryAggregate, mgmt.AggregateDevices)
	mgmtAPI.GET(URIInventoryAttrs, mgmt.DeviceAttrs)
	mgmtAPI.POST(URIInventorySearch, mgmt.SearchDevices)
	mgmtAPI.GET(URIInventorySearchAttrs, mgmt.SearchDeviceAttrs)
	// deployments
	mgmtAPI.POST(URIDeploymentsAggregate, mgmt.AggregateDeployments)
	mgmtAPI.POST(URIDeploymentsSearch, mgmt.SearchDeployments)

	return router
}
