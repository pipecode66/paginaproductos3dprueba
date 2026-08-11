function getHttpsBaseUrl(value) {
  try {
    const url = new URL(String(value || ''));
    return url.protocol === 'https:' ? url : null;
  } catch {
    return null;
  }
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
  const readyToActivate = productionEnvironment && infrastructureReady;

  let launchStage = 'test';
  if (productionEnvironment && !infrastructureReady) launchStage = 'production_incomplete';
  else if (readyToActivate && !productionAllowed) launchStage = 'production_locked';
  else if (readyToActivate && productionAllowed) launchStage = 'production_live';

  return {
    configured: coreReady && (!productionEnvironment || (Boolean(httpsBaseUrl) && productionAllowed)),
    boldConfigured: identityKeyConfigured && secretKeyConfigured,
    environment: boldConfig.environment,
    productionEnabled: productionAllowed,
    launchStage,
    infrastructureReady,
    readyToActivate,
    live: launchStage === 'production_live',
    canReceiveWebhooks: identityKeyConfigured && secretKeyConfigured && persistentStorageReady,
    webhookUrl: httpsBaseUrl ? new URL('/api/payments/bold/webhook', httpsBaseUrl).toString() : '',
    checks: {
      identityKeyConfigured,
      secretKeyConfigured,
      persistentStorageReady,
      publicBaseUrlHttps: Boolean(httpsBaseUrl),
      taxConfigured: Boolean(boldConfig.tax),
      productionEnvironment,
      productionAllowed,
    },
    storage,
  };
}
