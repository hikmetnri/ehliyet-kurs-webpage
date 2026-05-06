export function getFirebaseAuthErrorMessage(err, fallback) {
  const backendMessage = err.response?.data?.error || err.response?.data?.message;
  if (backendMessage) return backendMessage;

  switch (err.code) {
    case 'auth/popup-closed-by-user':
      return 'Google ile giriş iptal edildi.';
    case 'auth/popup-blocked':
      return 'Tarayıcı Google giriş penceresini engelledi. Popup izni verip tekrar deneyin.';
    case 'auth/unauthorized-domain':
      return `Bu adres Firebase Google giriş için yetkili değil: ${window.location.hostname}. Firebase Console > Authentication > Settings > Authorized domains alanına eklenmeli.`;
    case 'auth/operation-not-allowed':
      return 'Firebase Console üzerinde Google giriş sağlayıcısı aktif değil.';
    case 'auth/network-request-failed':
      return 'Firebase bağlantısı kurulamadı. İnternet bağlantısını veya reklam/izleme engelleyicileri kontrol edin.';
    case 'auth/cancelled-popup-request':
      return 'Google giriş penceresi zaten açık. Açık pencereyi kullanın veya tekrar deneyin.';
    default:
      return err.message ? `${fallback} (${err.code || err.message})` : fallback;
  }
}
