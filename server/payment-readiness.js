import { createHash } from 'node:crypto';

function getHttpsBaseUrl(value) {
  try {
    const url = new URL(String(value || ''));
    return url.protocol === 'https:' ? url : null;
  } catch {
    return null;
  }
}

function credentialFingerprint(value) {
  if (!value) return '';
  return createHash('sha256').update(value).digest('hex').slice(0, 12);
}

export function buildPaymentReadiness({ boldConfig, storage }) {
  const identityKeyConfigured = Boolean(boldConfig.identityKey);
  const secretKeyConfigured = Boolean(boldConfig.secretKey);
  const persistentStorageReady = Boolean(storage.configured && storage.ready);
  const httpsBaseUrl = getHttpsBaseUrl(boldConfig.publicBaseUrl);
  const coreReady = identityKeyConfigured && secretKeyConfigured && persistentStorageReady;
  const infrastructureReady = Boolean(coreReady && httpsBaseUrl);
  const productionEnvironment = boldConfig.environment === 'production';
  const productionAllowed = Boolean(boldConfig.productionEnabled);
  const credentialEnvironment = boldConfig.credentialEnvironment || boldConfig.environment;
  const credentialsMatchEnvironment = credentialEnvironment === boldConfig.environment
    || (credentialEnvironment === 'legacy' && !productionEnvironment);
  const environmentReady = infrastructureReady && credentialsMatchEnvironment;
  const readyToActivate = productionEnvironment && environmentReady;

  let launchStage = 'test';
  if (productionEnvironment && !environmentReady) launchStage = 'production_incomplete';
  else if (readyToActivate && !productionAllowed) launchStage = 'production_locked';
  else if (readyToActivate && productionAllowed) launchStage = 'production_live';

  return {
    configured: coreReady && credentialsMatchEnvironment
      && (!productionEnvironment || (Boolean(httpsBaseUrl) && productionAllowed)),
    boldConfigured: identityKeyConfigured && secretKeyConfigured,
    environment: boldConfig.environment,
    credentialEnvironment,
    credentialSource: boldConfig.credentialSource || 'direct',
    identityKeyFingerprint: credentialFingerprint(boldConfig.identityKey),
    productionEnabled: productionAllowed,
    launchStage,
    infrastructureReady,
    readyToActivate,
    live: launchStage === 'production_live',
    canReceiveWebhooks: identityKeyConfigured && secretKeyConfigured
      && persistentStorageReady && credentialsMatchEnvironment,
    webhookUrl: httpsBaseUrl ? new URL('/api/payments/bold/webhook', httpsBaseUrl).toString() : '',
    checks: {
      identityKeyConfigured,
      secretKeyConfigured,
      persistentStorageReady,
      publicBaseUrlHttps: Boolean(httpsBaseUrl),
      taxConfigured: Boolean(boldConfig.tax),
      productionEnvironment,
      productionAllowed,
      credentialsMatchEnvironment,
    },
    storage,
  };
}
