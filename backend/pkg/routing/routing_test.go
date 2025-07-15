// Copyright 2023 Northern.tech AS
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
package routing

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"reflect"
	"runtime"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"

	"github.com/mendersoftware/mender-server/pkg/rest.utils"
	utils "github.com/mendersoftware/mender-server/pkg/strings"
)

func TestSupportsMethod(t *testing.T) {
	t.Parallel()

	var sets = []struct {
		exp       bool
		method    string
		supported []string
	}{
		{
			true,
			http.MethodOptions,
			[]string{
				http.MethodGet,
				http.MethodPut,
				http.MethodOptions,
			},
		},
		{
			false,
			http.MethodOptions,
			[]string{
				http.MethodGet,
				http.MethodPut,
			},
		},
	}

	for i, tv := range sets {
		t.Run(fmt.Sprintf("tc %d", i), func(t *testing.T) {
			if supportsMethod(tv.method, tv.supported) != tv.exp {
				t.Errorf("failed case: %+v", tv)
			}
		})
	}
}

// We can't compare functions, so let's take the hard way and extract
// func name from runtime
func funcName(f interface{}) string {
	p := reflect.ValueOf(f).Pointer()
	rfunc := runtime.FuncForPC(p)
	return rfunc.Name()
}

func TestAutogenOptionRoutes(t *testing.T) {
	t.Parallel()

	// make sure that dummy and options are different to prevent
	// the compiler making this a single symbol
	dummy := func(c *gin.Context) {
		// dummy
		c.JSON(http.StatusOK, struct {
			x int
		}{
			2,
		})
	}
	options := func(c *gin.Context) {
		// dummy
		c.JSON(http.StatusOK, struct {
			x int
		}{
			1,
		})
	}
	gen := func(methods []string) gin.HandlerFunc {
		return options
	}

	router := gin.Default()

	// expecting rest.Options(..) to be added for /foo
	router.GET("/foo", dummy)
	router.POST("/foo", dummy)

	// no extra OPTIONS handler for /bar
	router.GET("/bar", dummy)
	router.OPTIONS("/bar", dummy)

	AutogenOptionsRoutes(router, gen)

	type expHandler map[string]gin.HandlerFunc
	exp := map[string]expHandler{
		"/foo": {
			http.MethodGet:     dummy,
			http.MethodPost:    dummy,
			http.MethodOptions: options,
		},
		"/bar": {
			http.MethodGet:     dummy,
			http.MethodOptions: dummy,
		},
	}

	// we're expecting 5 handlers in total
	routes := router.Routes()
	expCount := 5
	if len(routes) != expCount {
		t.Errorf("got %d handlers instead of %d", len(routes), expCount)
	}

	for _, r := range routes {
		v, ok := exp[r.Path]
		assert.Equal(t, ok, true, "failed with route "+r.Path+", route not present")

		h, ok := v[r.Method]
		assert.Equal(t, ok, true, fmt.Sprintf("failed with route %s, method %s not present", r.Path, r.Method))

		assert.Equal(t, r.Handler, funcName(h), "failed with route "+r.Path+", different handler")
	}
}

func TestAutogenOptionHeaders(t *testing.T) {
	t.Parallel()

	suppmeth := []string{
		http.MethodGet,
		http.MethodPut,
	}

	router := gin.Default()

	router.OPTIONS("/test", AllowHeaderOptionsGenerator(suppmeth))

	req, _ := http.NewRequest(http.MethodOptions,
		"http://localhost/test",
		nil,
	)
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	allowmeth := w.Header()[http.CanonicalHeaderKey("Allow")]

	// expecting only 2 allowed methods (should OPTIONS be
	// included in Allow too?)
	if len(allowmeth) != 2 {
		t.Errorf("too many allowed methods: %+v", allowmeth)
	}

	for _, sh := range suppmeth {
		if utils.ContainsString(sh, allowmeth) == false {
			t.Errorf("supported method %s not in allowed: %+v",
				sh, allowmeth)
		}
	}
}

func TestNoMethod(t *testing.T) {
	t.Parallel()

	router := NewGinRouter()

	router.GET("/foo", func(c *gin.Context) {
		c.Status(http.StatusOK)
	})

	req, _ := http.NewRequest(http.MethodDelete,
		"http://localhost/foo",
		nil,
	)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)
	assert.Equal(t, http.StatusMethodNotAllowed, w.Code)
	var err rest.Error
	_ = json.Unmarshal(w.Body.Bytes(), &err)

	assert.Equal(t, "method not allowed", err.Err)
}

func TestNoRoute(t *testing.T) {
	t.Parallel()

	router := NewGinRouter()
	router.GET("/foo", func(c *gin.Context) {
		c.Status(http.StatusOK)
	})

	req, _ := http.NewRequest(http.MethodDelete,
		"http://localhost/bar",
		nil,
	)

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)
	assert.Equal(t, http.StatusNotFound, w.Code)
	var err rest.Error
	_ = json.Unmarshal(w.Body.Bytes(), &err)

	assert.Equal(t, "not found", err.Err)
}
