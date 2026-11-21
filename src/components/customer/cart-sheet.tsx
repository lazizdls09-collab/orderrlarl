import { useEffect, useRef, useState } from "react";
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  ChefHat,
  Bike,
  UtensilsCrossed,
  MapPin,
  LoaderCircle,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useCart } from "@/lib/cart";
import { formatSum } from "@/lib/format";
import { submitOrder } from "@/lib/menu.functions";
import { saveMyOrder } from "@/lib/my-orders";
import { readProfile, saveProfile } from "@/lib/profile";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { useT } from "@/lib/i18n";

export function CartSheet({ initialMode = "dine_in" }: { initialMode?: "dine_in" | "delivery" }) {
  const [mode, setMode] = useState<"dine_in" | "delivery">(initialMode);
  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);
  const { t } = useT();
  const cart = useCart();
  const sendOrder = useServerFn(submitOrder);
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState<{ orderNo: number; delivery: boolean } | null>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [attract, setAttract] = useState(false);
  const prevCount = useRef(cart.count);

  useEffect(() => {
    const p = readProfile();
    setName(p.name);
    setPhone(p.phone);
    setAddress(p.address);
  }, []);

  useEffect(() => {
    const grew = cart.count > prevCount.current;
    prevCount.current = cart.count;
    if (!grew) return undefined;
    setAttract(true);
    const t = setTimeout(() => setAttract(false), 2200);
    return () => clearTimeout(t);
  }, [cart.count]);



  function detectLocation() {
    if (!("geolocation" in navigator)) {
      toast.error(t("cart_geo_unsupported"));
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
        toast.success(t("cart_located_at"));
      },
      () => {
        setLocating(false);
        toast.error(t("cart_geo_denied"));
      },
      { enableHighAccuracy: true, timeout: 15000 },
    );
  }

  async function submit() {
    const orderType = mode;
    if (!cart.lines.length) return;
    if (orderType === "dine_in" && !cart.tableNumber.trim()) {
      toast.error(t("cart_need_table"));
      return;
    }
    if (orderType === "delivery") {
      if (!coords) {
        toast.error(t("cart_need_location"));
        return;
      }
      if (!phone.trim()) {
        toast.error(t("cart_need_phone"));
        return;
      }
      saveProfile({ name: name.trim(), phone: phone.trim(), address: address.trim() });
    }
    setSending(true);
    try {
      const order = await sendOrder({
        data: {
          orderType,
          tableNumber: orderType === "dine_in" ? cart.tableNumber.trim() : null,
          address:
            orderType === "delivery"
              ? address.trim() ||
                (coords ? `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}` : null)
              : null,
          latitude: orderType === "delivery" ? (coords?.lat ?? null) : null,
          longitude: orderType === "delivery" ? (coords?.lng ?? null) : null,
          phone: orderType === "delivery" ? phone.trim() : null,
          customerName: name.trim() || null,
          notes: cart.notes || null,
          lines: cart.lines.map((l) => ({
            productId: l.productId,
            quantity: l.quantity,
          })),
        },
      });
      saveMyOrder({
        id: order.id,
        orderNo: order.orderNo,
        createdAt: new Date().toISOString(),
        orderType,
      });
      setDone({ orderNo: order.orderNo, delivery: orderType === "delivery" });
      cart.clear();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("cart_failed"));
    } finally {
      setSending(false);
    }
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) setDone(null);
      }}
    >
      <SheetTrigger asChild>
        <motion.button
          type="button"
          animate={
            attract
              ? { scale: [1, 1.08, 0.97, 1.05, 1], y: [0, -10, 0, -5, 0] }
              : { scale: 1, y: 0 }
          }
          transition={attract ? { duration: 1.1, repeat: 1, ease: "easeInOut" } : { duration: 0.2 }}
          className={`fixed bottom-[5.5rem] left-1/2 z-40 flex w-[min(92vw,26rem)] -translate-x-1/2 items-center justify-between gap-3 rounded-full gradient-primary px-5 py-4 text-primary-foreground shadow-glow press ${
            attract ? "ring-4 ring-primary/40" : ""
          }`}
        >
          {attract ? (
            <motion.span
              aria-hidden
              initial={{ opacity: 0.6, scale: 1 }}
              animate={{ opacity: 0, scale: 1.35 }}
              transition={{ duration: 1.1, repeat: Infinity }}
              className="pointer-events-none absolute inset-0 rounded-full bg-primary/50"
            />
          ) : null}
          <span className="relative flex items-center gap-2 text-sm font-bold">
            <ShoppingBag className="h-5 w-5" />
            {t("cart_title")} · {cart.count}
          </span>
          <span className="relative text-sm font-extrabold">{formatSum(cart.total)}</span>
        </motion.button>
      </SheetTrigger>

      <SheetContent side="right" className="flex w-full flex-col gap-0 sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="font-display text-xl">{t("cart_title")}</SheetTitle>
          <SheetDescription>{t("cart_subtitle")}</SheetDescription>
        </SheetHeader>

        {done ? null : (
          <div className="mx-4 mt-1 grid grid-cols-2 gap-2 rounded-2xl glass p-1">
            <button
              type="button"
              onClick={() => setMode("dine_in")}
              className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold press ${
                mode === "dine_in"
                  ? "gradient-primary text-primary-foreground shadow-glow"
                  : "text-muted-foreground"
              }`}
            >
              <UtensilsCrossed className="h-4 w-4" />
              {t("cart_dine")}
            </button>
            <button
              type="button"
              onClick={() => setMode("delivery")}
              className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold press ${
                mode === "delivery"
                  ? "gradient-primary text-primary-foreground shadow-glow"
                  : "text-muted-foreground"
              }`}
            >
              <Bike className="h-4 w-4" />
              {t("cart_delivery")}
            </button>
          </div>
        )}



        <AnimatePresence mode="wait">
          {done ? (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-1 flex-col px-6 py-10"
            >
              <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
                <motion.div
                  animate={{ rotate: [0, -10, 10, -6, 0], scale: [1, 1.06, 1] }}
                  transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 0.6 }}
                  className="grid h-20 w-20 place-items-center rounded-full gradient-primary text-primary-foreground shadow-glow"
                >
                  <ChefHat className="h-9 w-9" />
                </motion.div>
                <h3 className="text-xl font-extrabold text-foreground">
                  {t("cart_done_title")}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t("cart_done_no").replace("{n}", String(done.orderNo))}{" "}
                  {done.delivery ? t("cart_done_delivery") : t("cart_done_dine")}
                </p>
              </div>
              <button
                onClick={() => {
                  setOpen(false);
                  setDone(null);
                }}
                className="mt-6 w-full rounded-2xl gradient-primary py-4 text-sm font-extrabold text-primary-foreground press shadow-glow"
              >
                {t("cart_close")}
              </button>
            </motion.div>

          ) : (
            <motion.div key="cart" className="flex flex-1 flex-col overflow-hidden">
              <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
                {cart.lines.length === 0 ? (
                  <p className="py-16 text-center text-sm text-muted-foreground">
                    {t("cart_empty")}
                  </p>
                ) : (
                  cart.lines.map((l) => (
                    <div key={l.productId} className="flex gap-3 rounded-2xl glass p-3">
                      <img
                        src={l.image}
                        alt={l.name}
                        loading="lazy"
                        className="h-16 w-16 shrink-0 rounded-xl object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="truncate text-sm font-bold text-foreground">{l.name}</p>
                          <button
                            aria-label={t("cart_remove")}
                            onClick={() => cart.remove(l.productId)}
                            className="shrink-0 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="text-xs text-muted-foreground">{formatSum(l.price)}</p>
                        <div className="mt-2 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1 rounded-full bg-secondary p-1">
                            <button
                              aria-label={t("qty_dec")}
                              onClick={() => cart.setQty(l.productId, l.quantity - 1)}
                              className="grid h-6 w-6 place-items-center rounded-full press"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="w-5 text-center text-xs font-bold">{l.quantity}</span>
                            <button
                              aria-label={t("qty_inc")}
                              onClick={() => cart.setQty(l.productId, l.quantity + 1)}
                              className="grid h-6 w-6 place-items-center rounded-full press"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                          <span className="text-sm font-extrabold text-foreground">
                            {formatSum(l.price * l.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}

                <div className="space-y-3 pt-2">
                  {mode === "dine_in" ? (
                    <div>
                      <Label htmlFor="table">{t("cart_table")}</Label>
                      <Input
                        id="table"
                        inputMode="numeric"
                        placeholder={t("cart_table_ph")}
                        value={cart.tableNumber}
                        onChange={(e) => cart.setTableNumber(e.target.value)}
                        className="mt-1.5 rounded-xl"
                      />
                    </div>
                  ) : (
                    <>
                      <div>
                        <Label htmlFor="c-name">{t("cart_name")}</Label>
                        <Input
                          id="c-name"
                          maxLength={120}
                          placeholder={t("cart_name")}
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="mt-1.5 rounded-xl"
                        />
                      </div>
                      <div>
                        <Label htmlFor="c-phone">{t("cart_phone")}</Label>
                        <Input
                          id="c-phone"
                          inputMode="tel"
                          maxLength={30}
                          placeholder="+998 90 123 45 67"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="mt-1.5 rounded-xl"
                        />
                      </div>
                      <div>
                        <Label>{t("cart_place")}</Label>
                        <button
                          type="button"
                          onClick={detectLocation}
                          className="mt-1.5 flex w-full items-center gap-3 rounded-xl border border-border bg-secondary px-4 py-3 text-left text-sm font-semibold text-foreground press"
                        >
                          {locating ? (
                            <LoaderCircle className="h-4 w-4 shrink-0 animate-spin text-primary" />
                          ) : (
                            <MapPin className="h-4 w-4 shrink-0 text-primary" />
                          )}
                          <span className="min-w-0 flex-1 truncate">
                            {coords
                              ? `${t("cart_located_at")} (${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)})`
                              : locating
                                ? t("cart_locating")
                                : t("cart_detect")}
                          </span>
                          {coords ? (
                            <span className="shrink-0 text-[11px] font-bold text-primary">
                              {t("cart_refresh")}
                            </span>
                          ) : null}
                        </button>
                        <Input
                          id="c-address"
                          maxLength={300}
                          placeholder={t("cart_landmark")}
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          className="mt-2 rounded-xl"
                        />
                      </div>
                    </>
                  )}
                  <div>
                    <Label htmlFor="notes">{t("cart_notes")}</Label>
                    <Textarea
                      id="notes"
                      placeholder={t("cart_notes_ph")}
                      value={cart.notes}
                      onChange={(e) => cart.setNotes(e.target.value)}
                      className="mt-1.5 rounded-xl"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-border p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{t("cart_total")}</span>
                  <span className="text-xl font-extrabold text-foreground">
                    {formatSum(cart.total)}
                  </span>
                </div>
                <button
                  onClick={submit}
                  disabled={sending || cart.lines.length === 0}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl gradient-primary py-4 text-sm font-extrabold text-primary-foreground press shadow-glow disabled:opacity-50"
                >
                  {mode === "delivery" ? (
                    <Bike className="h-4 w-4" />
                  ) : (
                    <UtensilsCrossed className="h-4 w-4" />
                  )}
                  {sending ? t("cart_sending") : t("cart_submit")}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </SheetContent>
    </Sheet>
  );
}
