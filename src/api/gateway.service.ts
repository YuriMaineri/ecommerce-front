import { api } from './client';
import type { GatewayChargeResponse } from '../types';

/** Gateway de pagamento simulado (endpoint publico do backend). */
export const gatewayService = {
  async charge(reference: string, cardNumber: string, cardName?: string): Promise<GatewayChargeResponse> {
    const { data } = await api.post<GatewayChargeResponse>('/gateway/charge', {
      reference,
      cardNumber,
      cardName,
    });
    return data;
  },
};
