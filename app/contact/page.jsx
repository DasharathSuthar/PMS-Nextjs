'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');
  const [isError, setIsError] = useState(false);

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.message) {
      setResponseMessage('⚠️ Please fill all fields.');
      setIsError(true);
      setTimeout(() => setResponseMessage(''), 3000);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (data.success) {
        setResponseMessage(
          '✅ Thank you for contacting us! We’ll get back soon.'
        );
        setIsError(false);
        setFormData({ name: '', email: '', message: '' });
      } else {
        setResponseMessage(data.message || '❌ Failed to send message.');
        setIsError(true);
      }

      setTimeout(() => setResponseMessage(''), 4000);
    } catch (err) {
      setResponseMessage('❌ Something went wrong. Please try again.');
      setIsError(true);
      setTimeout(() => setResponseMessage(''), 4000);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-lg">
        <h1 className="text-2xl font-bold mb-2 text-center">Contact Us</h1>
        <p className="text-gray-600 text-center mb-6">
          We’d love to hear from you! Fill out the form below and our team will
          get back to you within 24–48 hours. You can also reach us at{' '}
          <span className="font-medium text-blue-600">support@example.com</span>
          .
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Name</Label>
            <Input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
            />
          </div>

          <div>
            <Label>Email</Label>
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="john@example.com"
            />
          </div>

          <div>
            <Label>Message</Label>
            <Textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Your message..."
              rows={5}
            />
          </div>

          <p className="text-xs text-gray-500">All fields are required.</p>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Sending...' : 'Send Message'}
          </Button>

          {responseMessage && (
            <p
              className={`text-center mt-3 ${
                isError ? 'text-red-600' : 'text-green-600'
              }`}
            >
              {responseMessage}
            </p>
          )}
        </form>

        <div className="mt-8 border-t pt-4 text-sm text-gray-600 text-center">
          <p>📍 Our Office: 123 Main Street, City, Country</p>
          <p>📞 Phone: +1 (555) 123-4567</p>
          <p>⏰ Support hours: Mon–Fri, 9am–6pm</p>
        </div>
      </div>
    </main>
  );
}
