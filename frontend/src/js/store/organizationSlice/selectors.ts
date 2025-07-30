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
import { EXTERNAL_PROVIDER } from '@northern.tech/store/constants';
import { RootState } from '@northern.tech/store/store';
import { createSelector } from '@reduxjs/toolkit';

export const getOrganization = (state: RootState) => state.organization.organization;
export const getExternalIntegrations = state => state.organization.externalDeviceIntegrations;
export const getAuditlogState = state => state.organization.auditlog.selectionState;
export const getAuditLog = state => state.organization.auditlog.events;
export const getAuditLogSelectionState = state => state.organization.auditlog.selectionState;
export const getBillingProfile = (state: RootState) => state.organization.organization.billing_profile;
export const getSubscription = (state: RootState) => state.organization.organization.subscription;
export const getCard = (state: RootState) => state.organization.card;
export const getSsoConfig = ({ organization: { ssoConfigs = [] } }) => ssoConfigs[0];
export const getTenantsList = state => state.organization.tenantList;
export const getWebhookEvents = state => state.organization.webhooks.events;
export const getWebhookEventsTotal = state => state.organization.webhooks.eventsTotal;

export const getDeviceTwinIntegrations = createSelector([getExternalIntegrations], integrations =>
  integrations.filter(integration => integration.id && EXTERNAL_PROVIDER[integration.provider]?.deviceTwin)
);
export const getIsServiceProvider = state => state.organization.organization.service_provider;

export const getWebhooks = createSelector([getExternalIntegrations], integrations =>
  integrations.filter(integration => integration.id && integration.provider === EXTERNAL_PROVIDER.webhook.provider)
);
export const getWebhookEventInfo = createSelector([getWebhooks, getWebhookEvents, getWebhookEventsTotal], (webhooks, events, eventsTotal) =>
  webhooks.length ? { events, eventsTotal } : { events: [], eventsTotal: 0 }
);

export const getAuditLogEntry = createSelector([getAuditLog, getAuditLogSelectionState], (events, { selectedId }) => {
  if (!selectedId) {
    return;
  }
  const [eventAction, eventTime] = atob(selectedId).split('|');
  return events.find(item => item.action === eventAction && item.time === eventTime);
});
