import { limitQuoteText } from '../../../utils/categoryContent';

const QUOTE_MAX_LENGTH = 350;

export const createAdminSettingsRepository = (client) => ({
  async loadSettings() {
    const response = await client.get('/admin/settings-map');
    const data = response.data;
    return {
      privacy_policy: data.privacy_policy || '',
      kvkk_text: data.kvkk_text || '',
      contact_email: data.contact_email || '',
      app_version_android: data.app_version_android || '1.0.0',
      app_version_ios: data.app_version_ios || '1.0.0',
      playstore_url: data.playstore_url || '',
      appstore_url: data.appstore_url || '',
    };
  },
  saveSetting(key, value) {
    return client.put(`/admin/settings-map/${key}`, { value });
  },
  async loadQuotes() {
    const response = await client.get('/quotes');
    const quotes = Array.isArray(response.data) ? response.data : (response.data?.data || []);
    return quotes.map(quote => ({ ...quote, text: limitQuoteText(quote.text, QUOTE_MAX_LENGTH) }));
  },
  saveQuote(id, form) {
    const payload = {
      ...form,
      text: limitQuoteText(form.text, QUOTE_MAX_LENGTH),
      author: form.author.trim(),
    };
    if (!payload.text) throw new Error('Söz metni zorunlu.');
    return id ? client.put(`/quotes/${id}`, payload) : client.post('/quotes', payload);
  },
  deleteQuote(id) { return client.delete(`/quotes/${id}`); },
  async loadFaqs() {
    const response = await client.get('/admin/faqs');
    return response.data || [];
  },
  saveFaq(id, form) {
    return id ? client.put(`/admin/faqs/${id}`, form) : client.post('/admin/faqs', form);
  },
  deleteFaq(id) { return client.delete(`/admin/faqs/${id}`); },
  setFaqActive(faq) {
    return client.put(`/admin/faqs/${faq._id}`, { ...faq, isActive: !faq.isActive });
  },
  async loadMaintenanceStatus() {
    const response = await client.get('/admin/maintenance-status');
    return response.data.isMaintenance;
  },
  async setMaintenance(enabled) {
    const response = await client.post('/admin/maintenance', { enabled });
    return response.data.isMaintenance;
  },
  async loadLogs() {
    const response = await client.get('/admin/logs');
    return response.data || [];
  },
  async createBackup() {
    const response = await client.get('/admin/backup');
    return response.data.filename;
  },
});
