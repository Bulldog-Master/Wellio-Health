// WebAuthn utility functions for passkey authentication

export const isWebAuthnSupported = (): boolean => {
  return !!(
    window.PublicKeyCredential &&
    navigator.credentials &&
    navigator.credentials.create
  );
};

export const bufferToBase64 = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

export const base64ToBuffer = (base64: string): ArrayBuffer => {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
};

export const registerPasskey = async (email: string): Promise<{
  credentialId: string;
  publicKey: string;
  counter: number;
}> => {
  if (!isWebAuthnSupported()) {
    throw new Error('WebAuthn is not supported on this device');
  }

  const challenge = new Uint8Array(32);
  crypto.getRandomValues(challenge);

  // Use the exact hostname for rpId
  const rpId = window.location.hostname;

  console.log('Registering passkey with rpId:', rpId);

  const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
    challenge: challenge,
    rp: {
      name: 'Wellio',
      id: rpId,
    },
    user: {
      id: new TextEncoder().encode(email),
      name: email,
      displayName: email,
    },
    pubKeyCredParams: [
      { alg: -7, type: 'public-key' },  // ES256
      { alg: -257, type: 'public-key' }, // RS256
    ],
    authenticatorSelection: {
      authenticatorAttachment: 'platform',
      userVerification: 'required',
      residentKey: 'preferred',
    },
    timeout: 60000,
    attestation: 'none',
  };

  try {
    const credential = await navigator.credentials.create({
      publicKey: publicKeyCredentialCreationOptions,
    }) as PublicKeyCredential;

    if (!credential) {
      throw new Error('Failed to create credential');
    }

    const response = credential.response as AuthenticatorAttestationResponse;

    return {
      credentialId: bufferToBase64(credential.rawId),
      publicKey: bufferToBase64(response.getPublicKey()!),
      counter: 0,
    };
  } catch (error) {
    console.error('Passkey registration error:', error);
    if (error instanceof Error) {
      if (error.name === 'NotAllowedError') {
        throw new Error('Registration cancelled or blocked by browser. Please ensure you allow the biometric prompt.');
      }
      throw error;
    }
    throw new Error('Failed to register passkey');
  }
};

export const authenticatePasskey = async (): Promise<{
  credentialId: string;
  signature: string;
  authenticatorData: string;
  clientDataJSON: string;
}> => {
  if (!isWebAuthnSupported()) {
    throw new Error('WebAuthn is not supported on this device');
  }

  const challenge = new Uint8Array(32);
  crypto.getRandomValues(challenge);

  // Use the exact hostname for rpId
  const rpId = window.location.hostname;

  console.log('Authenticating passkey with rpId:', rpId);

  const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
    challenge: challenge,
    rpId: rpId,
    timeout: 60000,
    userVerification: 'required',
  };

  try {
    const credential = await navigator.credentials.get({
      publicKey: publicKeyCredentialRequestOptions,
    }) as PublicKeyCredential;

    if (!credential) {
      throw new Error('Failed to get credential');
    }

    const response = credential.response as AuthenticatorAssertionResponse;

    return {
      credentialId: bufferToBase64(credential.rawId),
      signature: bufferToBase64(response.signature),
      authenticatorData: bufferToBase64(response.authenticatorData),
      clientDataJSON: bufferToBase64(response.clientDataJSON),
    };
  } catch (error) {
    console.error('Passkey authentication error:', error);
    if (error instanceof Error) {
      if (error.name === 'NotAllowedError') {
        throw new Error('Authentication cancelled or blocked. Please try again and allow the biometric prompt.');
      }
      throw error;
    }
    throw new Error('Failed to authenticate with passkey');
  }
};