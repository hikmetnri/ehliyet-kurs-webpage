export const createAccountSecurityRepository = (client) => ({
  async changePassword(currentPassword, newPassword) {
    const response = await client.put('/auth/change-password', {
      currentPassword, newPassword,
    });
    return response.data;
  },
});

export async function changePasswordAndSignOut({
  repository, currentPassword, newPassword, clearSession, redirect,
}) {
  const result = await repository.changePassword(currentPassword, newPassword);
  if (result.success) {
    clearSession();
    redirect('/login');
  }
  return result;
}
