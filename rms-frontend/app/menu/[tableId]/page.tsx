'use client';
import { useState, useEffect, use } from 'react';
import {
  ShoppingCart, Plus, Minus, Trash2, Search,
  UtensilsCrossed, CheckCircle, ChefHat, Star,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

type MenuCategory = 'APPETIZER' | 'MAIN_COURSE' | 'DESSERT' | 'BEVERAGE' | 'SPECIAL';

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: MenuCategory;
  available: boolean;
}

interface TableInfo {
  id: string;
  tableNumber: number;
  capacity: number;
  status: string;
}

interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  notes: string;
}

const CATEGORY_LABELS: Record<MenuCategory, string> = {
  APPETIZER: 'Appetizers',
  MAIN_COURSE: 'Main Course',
  DESSERT: 'Desserts',
  BEVERAGE: 'Beverages',
  SPECIAL: 'Specials',
};

const CATEGORY_EMOJI: Record<MenuCategory, string> = {
  APPETIZER: '🥗',
  MAIN_COURSE: '🍽️',
  DESSERT: '🍰',
  BEVERAGE: '🥤',
  SPECIAL: '⭐',
};

const CATEGORY_ORDER: MenuCategory[] = [
  'APPETIZER', 'MAIN_COURSE', 'DESSERT', 'BEVERAGE', 'SPECIAL',
];

export default function CustomerMenuPage({ params }: { params: Promise<{ tableId: string }> }) {
  const { tableId } = use(params);

  const [table, setTable] = useState<TableInfo | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<MenuCategory | 'ALL'>('ALL');
  const [customerName, setCustomerName] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState<number | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [showCart, setShowCart] = useState(false);
  // Feedback state
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tableRes, menuRes] = await Promise.all([
          axios.get(`${API_BASE}/public/tables/${tableId}`),
          axios.get(`${API_BASE}/public/menu`),
        ]);
        setTable(tableRes.data);
        setMenuItems(menuRes.data);
      } catch {
        setError('Could not load menu. Please ask staff for assistance.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [tableId]);

  const filteredItems = menuItems.filter((m) => {
    if (activeCategory !== 'ALL' && m.category !== activeCategory) return false;
    if (search && !m.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const groupedItems = CATEGORY_ORDER.reduce<Record<string, MenuItem[]>>((acc, cat) => {
    const items = filteredItems.filter((m) => m.category === cat);
    if (items.length > 0) acc[cat] = items;
    return acc;
  }, {});

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.menuItem.id === item.id);
      if (existing) {
        return prev.map((c) =>
          c.menuItem.id === item.id ? { ...c, quantity: c.quantity + 1 } : c,
        );
      }
      return [...prev, { menuItem: item, quantity: 1, notes: '' }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((c) => (c.menuItem.id === id ? { ...c, quantity: c.quantity + delta } : c))
        .filter((c) => c.quantity > 0),
    );
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((c) => c.menuItem.id !== id));
  };

  const total = cart.reduce((sum, c) => sum + c.menuItem.price * c.quantity, 0);
  const cartCount = cart.reduce((sum, c) => sum + c.quantity, 0);

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await axios.post(`${API_BASE}/public/orders`, {
        tableId,
        customerName: customerName.trim() || undefined,
        notes: notes.trim() || undefined,
        items: cart.map((c) => ({
          menuItemId: c.menuItem.id,
          quantity: c.quantity,
          notes: c.notes.trim() || undefined,
        })),
      });
      setOrderNumber(res.data.orderNumber);
      setOrderId(res.data.id);
      setOrderPlaced(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Order Confirmed Screen ──────────────────────────────────────────────────
  if (orderPlaced) {
    const handleFeedback = async () => {
      if (!feedbackRating || !orderId) return;
      setFeedbackSubmitting(true);
      try {
        await axios.post(`${API_BASE}/feedback`, {
          orderId,
          rating: feedbackRating,
          comment: feedbackComment.trim() || undefined,
          customerName: customerName.trim() || undefined,
        });
        setFeedbackSubmitted(true);
      } catch {
        // silently ignore — feedback is optional
        setFeedbackSubmitted(true);
      } finally {
        setFeedbackSubmitting(false);
      }
    };

    return (
      <div className="min-h-screen bg-[#FFF8F0] flex items-center justify-center p-6">
        <div className="max-w-sm w-full text-center space-y-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#4E342E] mb-2">Order Placed!</h1>
            {orderNumber && (
              <p className="text-4xl font-bold text-[#FF8A65] mb-2">#{orderNumber}</p>
            )}
            <p className="text-[#8D6E63]">
              Your order has been sent to the kitchen. We'll have it ready for you shortly.
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-[#F5E6D3] p-4 text-left space-y-2">
            {cart.map((c) => (
              <div key={c.menuItem.id} className="flex justify-between text-sm">
                <span className="text-[#4E342E]">{c.quantity}× {c.menuItem.name}</span>
                <span className="text-[#FF8A65] font-medium">${(c.menuItem.price * c.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="border-t border-[#F5E6D3] pt-2 flex justify-between font-bold">
              <span className="text-[#4E342E]">Total</span>
              <span className="text-[#FF8A65]">${total.toFixed(2)}</span>
            </div>
          </div>

          {/* Feedback form */}
          {!feedbackSubmitted ? (
            <div className="bg-white rounded-2xl border border-[#F5E6D3] p-4 text-left space-y-3">
              <p className="font-semibold text-[#4E342E] text-sm">How was your experience?</p>
              <div className="flex gap-2 justify-center">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button key={s} type="button" onClick={() => setFeedbackRating(s)}>
                    <Star className={`w-8 h-8 transition-colors ${s <= feedbackRating ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}`} />
                  </button>
                ))}
              </div>
              {feedbackRating > 0 && (
                <textarea
                  className="w-full rounded-xl border border-[#E8D5C4] px-3 py-2 text-sm text-[#4E342E] placeholder-[#BCAAA4] focus:outline-none focus:ring-2 focus:ring-[#FF8A65] resize-none"
                  rows={2}
                  placeholder="Any comments? (optional)"
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                />
              )}
              <div className="flex gap-2">
                <button type="button" onClick={() => setFeedbackSubmitted(true)} className="flex-1 text-sm text-[#8D6E63] hover:text-[#4E342E] transition-colors">
                  Skip
                </button>
                <button
                  type="button"
                  onClick={handleFeedback}
                  disabled={!feedbackRating || feedbackSubmitting}
                  className="flex-1 bg-[#FF8A65] text-white rounded-xl py-2 text-sm font-medium hover:bg-[#FF7043] transition-colors disabled:opacity-50"
                >
                  {feedbackSubmitting ? 'Sending…' : 'Submit'}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-3 text-sm text-green-700 flex items-center gap-2 justify-center">
              <CheckCircle className="w-4 h-4" /> Thank you for your feedback!
            </div>
          )}

          <p className="text-sm text-[#8D6E63]">
            Table {table?.tableNumber} · Thank you for dining with us 🍽️
          </p>
        </div>
      </div>
    );
  }

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF8F0] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#FF8A65] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-[#8D6E63]">Loading menu…</p>
        </div>
      </div>
    );
  }

  // ── Error ───────────────────────────────────────────────────────────────────
  if (error && !menuItems.length) {
    return (
      <div className="min-h-screen bg-[#FFF8F0] flex items-center justify-center p-6">
        <div className="text-center space-y-3 max-w-sm">
          <UtensilsCrossed className="w-12 h-12 text-[#8D6E63] mx-auto" />
          <p className="text-[#4E342E] font-semibold">{error}</p>
        </div>
      </div>
    );
  }

  const categories = CATEGORY_ORDER.filter((cat) =>
    menuItems.some((m) => m.category === cat),
  );

  return (
    <div className="min-h-screen bg-[#FFF8F0]">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-[#4E342E] text-white shadow-md">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ChefHat className="w-5 h-5 text-[#FF8A65]" />
            <div>
              <p className="font-bold text-sm leading-tight">Bistro RMS</p>
              {table && (
                <p className="text-xs text-[#F5E6D3]">Table {table.tableNumber}</p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowCart(!showCart)}
            className="relative flex items-center gap-2 bg-[#FF8A65] hover:bg-[#FF7043] transition-colors rounded-xl px-3 py-2 text-sm font-medium"
          >
            <ShoppingCart className="w-4 h-4" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-white text-[#FF8A65] text-xs font-bold rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
            {total > 0 ? `$${total.toFixed(2)}` : 'Cart'}
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pb-32">
        {/* Search */}
        <div className="py-4">
          <Input
            placeholder="Search menu…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            type="button"
            onClick={() => setActiveCategory('ALL')}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              activeCategory === 'ALL'
                ? 'bg-[#4E342E] text-white'
                : 'bg-white text-[#4E342E] border border-[#F5E6D3]'
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                activeCategory === cat
                  ? 'bg-[#4E342E] text-white'
                  : 'bg-white text-[#4E342E] border border-[#F5E6D3]'
              }`}
            >
              {CATEGORY_EMOJI[cat]} {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>

        {/* Menu Items */}
        <div className="mt-4 space-y-6">
          {Object.entries(groupedItems).map(([cat, items]) => (
            <div key={cat}>
              <h2 className="text-base font-bold text-[#4E342E] mb-3 flex items-center gap-2">
                <span>{CATEGORY_EMOJI[cat as MenuCategory]}</span>
                {CATEGORY_LABELS[cat as MenuCategory]}
              </h2>
              <div className="space-y-2">
                {items.map((item) => {
                  const cartItem = cart.find((c) => c.menuItem.id === item.id);
                  return (
                    <div
                      key={item.id}
                      className={`bg-white rounded-2xl border p-4 flex items-center gap-4 transition-all ${
                        cartItem ? 'border-[#FF8A65] shadow-sm' : 'border-[#F5E6D3]'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-[#4E342E] text-sm">{item.name}</p>
                        {item.description && (
                          <p className="text-xs text-[#8D6E63] mt-0.5 line-clamp-2">
                            {item.description}
                          </p>
                        )}
                        <p className="text-[#FF8A65] font-bold mt-1">${item.price.toFixed(2)}</p>
                      </div>
                      <div className="flex-shrink-0">
                        {cartItem ? (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, -1)}
                              className="w-8 h-8 rounded-full bg-[#F5E6D3] flex items-center justify-center hover:bg-[#E8D5C4] transition-colors"
                            >
                              <Minus className="w-3.5 h-3.5 text-[#4E342E]" />
                            </button>
                            <span className="w-6 text-center font-bold text-[#4E342E]">
                              {cartItem.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, 1)}
                              className="w-8 h-8 rounded-full bg-[#FF8A65] flex items-center justify-center hover:bg-[#FF7043] transition-colors"
                            >
                              <Plus className="w-3.5 h-3.5 text-white" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => addToCart(item)}
                            className="w-9 h-9 rounded-full bg-[#FF8A65] flex items-center justify-center hover:bg-[#FF7043] transition-colors shadow-sm"
                          >
                            <Plus className="w-4 h-4 text-white" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {filteredItems.length === 0 && (
            <div className="text-center py-12 text-[#8D6E63]">
              <UtensilsCrossed className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p>No items found</p>
            </div>
          )}
        </div>
      </div>

      {/* Cart Drawer */}
      {showCart && (
        <div className="fixed inset-0 z-40 flex flex-col justify-end">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowCart(false)}
          />
          <div className="relative bg-white rounded-t-3xl max-h-[80vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#F5E6D3]">
              <h2 className="font-bold text-[#4E342E] text-lg flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-[#FF8A65]" />
                Your Order
              </h2>
              <button
                type="button"
                onClick={() => setShowCart(false)}
                className="text-[#8D6E63] hover:text-[#4E342E] text-2xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="overflow-y-auto flex-1 px-5 py-3 space-y-3">
              {cart.length === 0 ? (
                <div className="text-center py-8 text-[#8D6E63]">
                  <ShoppingCart className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p>Your cart is empty</p>
                </div>
              ) : (
                <>
                  {cart.map((c) => (
                    <div
                      key={c.menuItem.id}
                      className="flex items-center gap-3 bg-[#FFF8F0] rounded-xl p-3"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-[#4E342E] text-sm truncate">
                          {c.menuItem.name}
                        </p>
                        <p className="text-xs text-[#FF8A65] font-semibold">
                          ${(c.menuItem.price * c.quantity).toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => updateQuantity(c.menuItem.id, -1)}
                          className="w-7 h-7 rounded-full bg-white border border-[#E8D5C4] flex items-center justify-center"
                        >
                          <Minus className="w-3 h-3 text-[#4E342E]" />
                        </button>
                        <span className="w-5 text-center text-sm font-bold text-[#4E342E]">
                          {c.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(c.menuItem.id, 1)}
                          className="w-7 h-7 rounded-full bg-white border border-[#E8D5C4] flex items-center justify-center"
                        >
                          <Plus className="w-3 h-3 text-[#4E342E]" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeFromCart(c.menuItem.id)}
                          className="w-7 h-7 rounded-full bg-red-50 flex items-center justify-center ml-1"
                        >
                          <Trash2 className="w-3 h-3 text-red-400" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Customer name + notes */}
                  <div className="space-y-3 pt-2">
                    <Input
                      label="Your Name (optional)"
                      placeholder="e.g. John"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                    />
                    <Input
                      label="Special Requests (optional)"
                      placeholder="Allergies, preferences…"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>
                </>
              )}
            </div>

            {cart.length > 0 && (
              <div className="px-5 py-4 border-t border-[#F5E6D3] space-y-3">
                {error && (
                  <p className="text-sm text-red-500 text-center">{error}</p>
                )}
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-[#4E342E]">Total</span>
                  <span className="font-bold text-2xl text-[#FF8A65]">${total.toFixed(2)}</span>
                </div>
                <Button
                  className="w-full"
                  onClick={handlePlaceOrder}
                  loading={submitting}
                  disabled={submitting}
                >
                  {submitting ? 'Placing Order…' : `Place Order · $${total.toFixed(2)}`}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating cart button (when cart has items and drawer is closed) */}
      {cart.length > 0 && !showCart && (
        <div className="fixed bottom-6 left-0 right-0 flex justify-center z-30 px-4">
          <button
            type="button"
            onClick={() => setShowCart(true)}
            className="flex items-center gap-3 bg-[#4E342E] text-white rounded-2xl px-6 py-4 shadow-xl hover:bg-[#3E2723] transition-colors"
          >
            <ShoppingCart className="w-5 h-5" />
            <span className="font-semibold">
              {cartCount} item{cartCount !== 1 ? 's' : ''} · ${total.toFixed(2)}
            </span>
            <span className="bg-[#FF8A65] text-white text-xs font-bold px-2 py-0.5 rounded-lg">
              View Order
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
