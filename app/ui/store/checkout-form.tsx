"use client";

import { useState } from 'react';
import { useFormState } from 'react-dom';
import { placeOrder } from '@/app/lib/store-actions';
import { SubmitButton } from './submit-button';

type Address = {
  id: string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
};

const initialState = {
  error: null as string | null,
};

type CheckoutFormProps = {
  addresses: Address[];
};

export function CheckoutForm({ addresses }: CheckoutFormProps) {
  const [mode, setMode] = useState<'existing' | 'new'>(
    addresses.length > 0 ? 'existing' : 'new',
  );
  const [state, formAction] = useFormState(placeOrder, initialState);

  return (
    <form action={formAction} className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Shipping address</h2>
          {addresses.length > 0 && (
            <div className="flex gap-6 text-sm text-gray-600">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="addressMode"
                  value="existing"
                  checked={mode === 'existing'}
                  onChange={() => setMode('existing')}
                />
                Use saved address
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="addressMode"
                  value="new"
                  checked={mode === 'new'}
                  onChange={() => setMode('new')}
                />
                Add new address
              </label>
            </div>
          )}
        </div>

        {addresses.length === 0 && (
          <input type="hidden" name="addressMode" value="new" />
        )}

        {mode === 'existing' && addresses.length > 0 && (
          <div className="mt-4 space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Select address
              <select
                name="addressId"
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                defaultValue={
                  addresses.find((addr) => addr.isDefault)?.id || addresses[0].id
                }
              >
                {addresses.map((address) => (
                  <option key={address.id} value={address.id}>
                    {address.fullName} • {address.street}, {address.city}
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}

        {mode === 'new' && (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700">
                Full name
                <input
                  type="text"
                  name="fullName"
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  placeholder="Jane Doe"
                />
              </label>
            </div>
            <label className="text-sm font-medium text-gray-700">
              Phone number
              <input
                type="tel"
                name="phone"
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                placeholder="+1 555 123 4567"
              />
            </label>
            <label className="text-sm font-medium text-gray-700">
              Street address
              <input
                type="text"
                name="street"
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                placeholder="123 Main Street"
              />
            </label>
            <label className="text-sm font-medium text-gray-700">
              City
              <input
                type="text"
                name="city"
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                placeholder="San Francisco"
              />
            </label>
            <label className="text-sm font-medium text-gray-700">
              State / Province
              <input
                type="text"
                name="state"
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                placeholder="California"
              />
            </label>
            <label className="text-sm font-medium text-gray-700">
              Postal code
              <input
                type="text"
                name="postalCode"
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                placeholder="94110"
              />
            </label>
            <label className="text-sm font-medium text-gray-700">
              Country
              <input
                type="text"
                name="country"
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                placeholder="United States"
              />
            </label>
          </div>
        )}
      </div>

      {state.error && (
        <p className="text-sm font-medium text-red-600">{state.error}</p>
      )}

      <SubmitButton className="w-full justify-center py-3 text-base font-semibold">
        Place order
      </SubmitButton>
    </form>
  );
}

