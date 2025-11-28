// Cryptographically secure random number generation

export const generateSecurePassword = (length: number, options: { symbols: boolean, numbers: boolean, uppercase: boolean }): string => {
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";
  const symbols = "!@#$%^&*()_+~`|}{[]:;?><,./-=";

  let charset = lowercase;
  if (options.uppercase) charset += uppercase;
  if (options.numbers) charset += numbers;
  if (options.symbols) charset += symbols;

  let retVal = "";
  const values = new Uint32Array(length);
  crypto.getRandomValues(values);

  for (let i = 0; i < length; i++) {
    retVal += charset[values[i] % charset.length];
  }
  return retVal;
};

export const generateSecureHex = (bits: number): string => {
  const bytes = bits / 8;
  const array = new Uint8Array(bytes);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

export const generateSecureBase64 = (bits: number): string => {
  const bytes = bits / 8;
  const array = new Uint8Array(bytes);
  crypto.getRandomValues(array);
  let binary = '';
  const len = array.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(array[i]);
  }
  return window.btoa(binary);
};

export const generateUUID = (): string => {
  return crypto.randomUUID();
};
