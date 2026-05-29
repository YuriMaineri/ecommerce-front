import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { gatewayService } from '../api/gateway.service';
import { getApiErrorMessage } from '../api/client';
import { ordersService } from '../api/orders.service';
import { Alert } from '../components/Alert';
import { TextField } from '../components/TextField';
import { useCart } from '../hooks/useCart';
import type { OrderStatus } from '../types';
import { formatCurrency } from '../utils/format';

const TEST_CARDS = {
  approve: '4242 4242 4242 4242',
  decline: '4000 0000 0000 0002',
};

type Phase = 'form' | 'processing' | 'approved' | 'declined' | 'timeout';

export function PaymentPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { refresh: refreshCart } = useCart();

  const state = (location.state as { reference?: string; amount?: number } | null) ?? {};
  const [reference] = useState<string | undefined>(state.reference);
  const amount = state.amount;

  const [card, setCard] = useState('');
  const [cardName, setCardName] = useState('');
  const [error, setError] = useState('');
  const [phase, setPhase] = useState<Phase>('form');

  const pollRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (pollRef.current) window.clearInterval(pollRef.current);
    };
  }, []);

  // Sessao de pagamento sem referencia (ex.: refresh da pagina): nao da pra cobrar.
  if (!reference || !orderId) {
    return (
      <div className="mx-auto max-w-md py-12 text-center">
        <h1 className="text-xl font-bold text-slate-900">Sessao de pagamento expirada</h1>
        <p className="mt-2 text-slate-500">Volte ao carrinho e inicie o pagamento novamente.</p>
        <Link to="/cart" className="btn-primary mt-6">
          Voltar ao carrinho
        </Link>
      </div>
    );
  }

  function startPolling() {
    let attempts = 0;
    const maxAttempts = 15; // ~15s
    pollRef.current = window.setInterval(async () => {
      attempts += 1;
      try {
        const order = await ordersService.getById(orderId!);
        const status: OrderStatus = order.status;
        if (status === 'PAID') {
          stopPolling();
          setPhase('approved');
          void refreshCart();
        } else if (status === 'CREATED' || status === 'CANCELLED') {
          // Recusado: o backend devolve o pedido para CREATED.
          stopPolling();
          setPhase('declined');
          void refreshCart();
        }
      } catch {
        // ignora erros transitorios de polling
      }
      if (attempts >= maxAttempts && pollRef.current) {
        stopPolling();
        setPhase('timeout');
      }
    }, 1000);
  }

  function stopPolling() {
    if (pollRef.current) {
      window.clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }

  async function handlePay(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (card.replace(/\D/g, '').length < 13) {
      setError('Informe um numero de cartao valido (use um dos cartoes de teste).');
      return;
    }
    setPhase('processing');
    try {
      await gatewayService.charge(reference!, card, cardName);
      startPolling();
    } catch (err) {
      setPhase('form');
      setError(getApiErrorMessage(err, 'Falha ao iniciar a cobranca.'));
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="card p-8">
        <h1 className="text-2xl font-bold text-slate-900">Pagamento</h1>
        {typeof amount === 'number' && (
          <p className="mt-1 text-slate-500">
            Total a pagar: <span className="font-semibold text-slate-800">{formatCurrency(amount)}</span>
          </p>
        )}

        {phase === 'approved' && (
          <div className="mt-6 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-green-100 text-2xl text-green-600">
              ✓
            </div>
            <h2 className="mt-4 text-lg font-semibold text-slate-900">Pagamento aprovado!</h2>
            <p className="mt-1 text-sm text-slate-500">Seu pedido foi confirmado.</p>
            <button className="btn-primary mt-6 w-full" onClick={() => navigate('/orders')}>
              Ver meus pedidos
            </button>
          </div>
        )}

        {phase === 'declined' && (
          <div className="mt-6 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-red-100 text-2xl text-red-600">
              ✕
            </div>
            <h2 className="mt-4 text-lg font-semibold text-slate-900">Pagamento recusado</h2>
            <p className="mt-1 text-sm text-slate-500">
              Seu carrinho foi preservado. Voce pode tentar novamente.
            </p>
            <button className="btn-primary mt-6 w-full" onClick={() => navigate('/cart')}>
              Voltar ao carrinho
            </button>
          </div>
        )}

        {phase === 'timeout' && (
          <div className="mt-6">
            <Alert variant="info">
              O pagamento ainda esta sendo processado. Verifique seus pedidos em instantes.
            </Alert>
            <button className="btn-secondary mt-4 w-full" onClick={() => navigate('/orders')}>
              Ver meus pedidos
            </button>
          </div>
        )}

        {phase === 'processing' && (
          <div className="mt-8 flex flex-col items-center gap-3 text-slate-500">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-brand-600" />
            <span className="text-sm">Processando pagamento...</span>
          </div>
        )}

        {phase === 'form' && (
          <>
            <div className="mt-6 rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
              <p className="font-medium text-slate-600">Cartoes de teste:</p>
              <button
                type="button"
                className="mt-1 block text-left text-brand-600 hover:underline"
                onClick={() => setCard(TEST_CARDS.approve)}
              >
                {TEST_CARDS.approve} → aprova
              </button>
              <button
                type="button"
                className="block text-left text-brand-600 hover:underline"
                onClick={() => setCard(TEST_CARDS.decline)}
              >
                {TEST_CARDS.decline} → recusa
              </button>
            </div>

            <form onSubmit={handlePay} className="mt-4 space-y-4" noValidate>
              {error && <Alert variant="error">{error}</Alert>}
              <TextField
                label="Numero do cartao"
                name="cardNumber"
                value={card}
                onChange={(e) => setCard(e.target.value)}
                placeholder="0000 0000 0000 0000"
                inputMode="numeric"
              />
              <TextField
                label="Nome no cartao"
                name="cardName"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                placeholder="NOME SOBRENOME"
              />
              <button type="submit" className="btn-primary w-full">
                Pagar {typeof amount === 'number' ? formatCurrency(amount) : ''}
              </button>
              <Link to="/cart" className="btn-secondary w-full">
                Cancelar
              </Link>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
