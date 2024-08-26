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
package mongo

import (
	"github.com/mendersoftware/mender-server/pkg/mongo/migrate"
	"go.mongodb.org/mongo-driver/mongo"
)

type migration_1_2_2 struct {
	client *mongo.Client
	db     string
}

// Up drops index with len(name) > 70 chars in the 'deployments' collection
func (m *migration_1_2_2) Up(from migrate.Version) error {
	// There's no indexes to remove here as the only malformed index name
	// is handeled by 1.2.1 migration. We only need to make sure that the
	// new indexes exists

	// create the 'short' index
	storage := NewDataStoreMongoWithClient(m.client)
	if err := storage.EnsureIndexes(m.db, CollectionDevices,
		StatusIndexes,
		DeviceIDStatusIndexes,
		DeploymentIdIndexes); err != nil {
		return err
	}
	return storage.EnsureIndexes(m.db, CollectionDeployments,
		DeploymentCreatedIndex,
		DeploymentDeviceStatusFinishedIndex)

}

func (m *migration_1_2_2) Version() migrate.Version {
	return migrate.MakeVersion(1, 2, 2)
}