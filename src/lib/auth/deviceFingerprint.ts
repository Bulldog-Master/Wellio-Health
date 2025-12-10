// Generate a unique device fingerprint based on browser characteristics
export const generateDeviceFingerprint = async (): Promise<string> => {
  const components = [
    navigator.userAgent,
    navigator.language,
    new Date().getTimezoneOffset(),
    screen.width,
    screen.height,
    screen.colorDepth,
    navigator.hardwareConcurrency || 'unknown',
    navigator.platform,
  ];

  const componentString = components.join('|');
  
  // Use SubtleCrypto for hashing
  const encoder = new TextEncoder();
  const data = encoder.encode(componentString);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return hashHex;
};

export const getDeviceName = (): string => {
  const ua = navigator.userAgent;
  
  if (ua.includes('Mobile')) {
    if (ua.includes('iPhone')) return 'iPhone';
    if (ua.includes('iPad')) return 'iPad';
    if (ua.includes('Android')) return 'Android Device';
    return 'Mobile Device';
  }
  
  if (ua.includes('Mac')) return 'Mac';
  if (ua.includes('Windows')) return 'Windows PC';
  if (ua.includes('Linux')) return 'Linux PC';
  
  return 'Unknown Device';
};

export const getStoredFingerprint = (): string | null => {
  return localStorage.getItem('device_fingerprint');
};

export const storeFingerprint = (fingerprint: string): void => {
  localStorage.setItem('device_fingerprint', fingerprint);
};
