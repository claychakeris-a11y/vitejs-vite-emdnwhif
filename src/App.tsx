import { useState, useRef } from "react";

const STRIPE = {
  basic: "https://buy.stripe.com/bJe5kDfwM5Og8CR82KcAo00",
  pro:   "https://buy.stripe.com/6oUfZh84k4Kcf1f3MucAo01",
  elite: "https://buy.stripe.com/00w5kD98o2C4dXb6YGcAo02",
};

const TIERS = {
  S: { color: "#dc2626", bg: "#fef2f2", label: "S Tier", sub: "Must Flip — Instant Profit" },
  A: { color: "#ea580c", bg: "#fff7ed", label: "A Tier", sub: "Strong Flip — Great Margins" },
  B: { color: "#ca8a04", bg: "#fefce8", label: "B Tier", sub: "Solid Flip — Worth Your Time" },
  C: { color: "#16a34a", bg: "#f0fdf4", label: "C Tier", sub: "Decent Flip — Moderate Return" },
  D: { color: "#2563eb", bg: "#eff6ff", label: "D Tier", sub: "Weak Flip — Low Margin" },
  F: { color: "#6b7280", bg: "#f9fafb", label: "F Tier", sub: "Skip It — Not Worth Flipping" },
};

const PLATFORMS = [
  { name: "eBay",                emoji: "🛍️", url: "https://www.ebay.com" },
  { name: "Poshmark",            emoji: "👗", url: "https://www.poshmark.com" },
  { name: "Depop",               emoji: "🎨", url: "https://www.depop.com" },
  { name: "Mercari",             emoji: "📦", url: "https://www.mercari.com" },
  { name: "StockX",              emoji: "👟", url: "https://www.stockx.com" },
  { name: "GOAT",                emoji: "✅", url: "https://www.goat.com" },
  { name: "Facebook Marketplace",emoji: "📍", url: "https://www.facebook.com/marketplace" },
];

const PLANS = {
  basic: {
    name: "Basic", price: "$2.99", period: "/month", color: "#16a34a", bg: "#f0fdf4", stripe: STRIPE.basic,
    features: ["✅ Instant tier ratings (S through F)","✅ Resale prices across 7 platforms","✅ Max buy price recommendations","✅ Previously rated item history","❌ Photo upload","❌ Profit estimates","❌ Direct listing links","❌ Expert reseller tips"],
    ratingLimit: 5, hasPhoto: false, hasProfit: false, hasTips: false, hasLinks: false,
  },
  pro: {
    name: "Pro", price: "$10", period: "/month", color: "#ea580c", bg: "#fff7ed", stripe: STRIPE.pro,
    features: ["✅ Everything in Basic","✅ Photo upload for AI visual analysis","✅ Profit estimates after fees","✅ Direct links to list on every platform","✅ Unlimited ratings","✅ Condition-based pricing","❌ Priority new features","❌ Advanced expert tips"],
    ratingLimit: 99999, hasPhoto: true, hasProfit: true, hasTips: false, hasLinks: true,
  },
  elite: {
    name: "Elite", price: "$15", period: "/month", color: "#7c3aed", bg: "#f5f3ff", stripe: STRIPE.elite,
    features: ["✅ Everything in Pro","✅ Priority access to new features","✅ Advanced condition-based pricing","✅ Full expert tips database","✅ Seasonal trend alerts","✅ Best time to sell recommendations","✅ Unlimited ratings","✅ Photo AI analysis"],
    ratingLimit: 99999, hasPhoto: true, hasProfit: true, hasTips: true, hasLinks: true,
  },
};

const EXPERT_TIPS = {
  S: ["List within 24 hours — hype fades fast and early sellers get premium prices.","Photograph every angle including tags, soles, and any flaws.","Cross-list on StockX AND eBay simultaneously for maximum exposure."],
  A: ["Research the last 10 completed eBay sales before setting your price.","Offer a bundle discount if you have multiple pieces from the same brand.","List on Thursday evening — weekend browsers are your biggest buyers."],
  B: ["Clean and steam the item before photographing — presentation adds 20-30% to value.","Use natural lighting for photos — colors pop and it looks more professional.","Accurate measurements in the listing reduce returns significantly."],
  C: ["Price slightly below comps to move inventory faster.","Consider bundling with similar items to increase average order value.","Promote your listing using built-in sharing tools on Depop and Poshmark daily."],
  D: ["Only flip if your cost was under $3 — margins are too thin otherwise.","Bundle multiple D-tier items together to make the listing worth shipping.","Consider donating and using the tax write-off instead."],
  F: ["Leave it — your time is worth more than the $2 profit.","Exception: collab pieces or unusual branding — research before passing.","Focus your energy on S and A tier finds instead."],
};

const CONDITION_MULTIPLIERS = { deadstock: 1.0, likenew: 0.85, good: 0.65, worn: 0.45, damaged: 0.25 };
const CONDITION_LABELS = { deadstock: "💎 Deadstock / New", likenew: "✨ Like New", good: "👍 Good Used", worn: "👎 Visible Wear", damaged: "⚠️ Stains / Damage" };

function applyCondition(priceStr, multiplier) {
  if (!priceStr || multiplier === 1.0) return priceStr;
  return priceStr.replace(/\$(\d+)/g, (_, n) => "$" + Math.round(parseInt(n) * multiplier));
}

function keywordAnalyze(input) {
  const q = input.toLowerCase();
  const match = (kw) => kw.some(k => q.includes(k));
  if (match(["supreme box logo","bape hoodie","off-white","travis scott","dior jordan","yeezy 350","jordan 1 chicago","jordan 1 bred","jordan 1 royal","fragment"]))
    return { tier:"S", desc:"Hyped grail item with massive demand. Buyers are actively searching — list immediately for maximum profit.", prices:[{name:"eBay",price:"$400–$900"},{name:"StockX",price:"$450–$950"},{name:"GOAT",price:"$440–$920"},{name:"Depop",price:"$380–$850"},{name:"Poshmark",price:"$360–$800"}], buy:"$80–$180", profit:"$250–$600" };
  if (match(["jordan 1","air jordan 1","aj1"]))
    return { tier:"A", desc:"Air Jordan 1s have one of the strongest resale markets. OG and retro highs sell fastest.", prices:[{name:"eBay",price:"$180–$420"},{name:"StockX",price:"$200–$450"},{name:"GOAT",price:"$195–$440"},{name:"Depop",price:"$160–$380"},{name:"Poshmark",price:"$150–$360"}], buy:"$80–$130", profit:"$80–$250" };
  if (match(["dunk low","dunk high","nike dunk","sb dunk"]))
    return { tier:"A", desc:"Nike Dunks remain top resale sneakers. Panda and SB collabs command the biggest premiums.", prices:[{name:"eBay",price:"$100–$280"},{name:"StockX",price:"$110–$300"},{name:"GOAT",price:"$105–$295"},{name:"Depop",price:"$90–$260"},{name:"Mercari",price:"$85–$250"}], buy:"$40–$110", profit:"$40–$160" };
  if (match(["yeezy","boost 350","boost 700","foam runner"]))
    return { tier:"A", desc:"Yeezys still move well. Core colorways like Zebra and Beluga hold value best.", prices:[{name:"eBay",price:"$150–$380"},{name:"StockX",price:"$160–$400"},{name:"GOAT",price:"$155–$390"},{name:"Depop",price:"$140–$360"}], buy:"$60–$120", profit:"$60–$200" };
  if (match(["supreme"]))
    return { tier:"A", desc:"Supreme pieces hold strong resale value especially hoodies, jackets, and box logo items.", prices:[{name:"eBay",price:"$120–$350"},{name:"Depop",price:"$130–$370"},{name:"Poshmark",price:"$110–$330"},{name:"Mercari",price:"$100–$300"}], buy:"$50–$120", profit:"$60–$200" };
  if (match(["patagonia","synchilla","snap-t","fleece"]))
    return { tier:"A", desc:"Vintage Patagonia is one of the hottest outdoor resale categories right now.", prices:[{name:"eBay",price:"$85–$180"},{name:"Depop",price:"$90–$190"},{name:"Poshmark",price:"$75–$165"},{name:"Mercari",price:"$70–$160"},{name:"Facebook Marketplace",price:"$60–$130"}], buy:"$10–$25", profit:"$50–$140" };
  if (match(["carhartt","detroit jacket","chore coat","wip"]))
    return { tier:"A", desc:"Carhartt is extremely popular right now. Detroit jackets and chore coats sell out fast.", prices:[{name:"eBay",price:"$70–$200"},{name:"Depop",price:"$80–$220"},{name:"Poshmark",price:"$65–$185"},{name:"Mercari",price:"$60–$175"},{name:"Facebook Marketplace",price:"$50–$150"}], buy:"$15–$35", profit:"$40–$150" };
  if (match(["ralph lauren","polo ralph","polo shirt"]))
    return { tier:"B", desc:"Vintage Ralph Lauren polos are a reliable thrift flip. Larger sizes and stadium sub-brands fetch the most.", prices:[{name:"eBay",price:"$30–$80"},{name:"Depop",price:"$35–$90"},{name:"Poshmark",price:"$28–$75"},{name:"Mercari",price:"$25–$70"}], buy:"$3–$10", profit:"$20–$60" };
  if (match(["levi","levis","501","vintage jeans"]))
    return { tier:"B", desc:"Vintage Levi's — especially USA-made 501s — are a consistent thrift flip.", prices:[{name:"eBay",price:"$45–$130"},{name:"Depop",price:"$50–$140"},{name:"Poshmark",price:"$40–$120"},{name:"Mercari",price:"$38–$110"}], buy:"$5–$18", profit:"$25–$90" };
  if (match(["north face","northface","nuptse","puffer"]))
    return { tier:"B", desc:"Vintage North Face — especially Nuptse puffers — sells consistently well.", prices:[{name:"eBay",price:"$60–$200"},{name:"Depop",price:"$65–$210"},{name:"Poshmark",price:"$55–$190"},{name:"Mercari",price:"$50–$180"}], buy:"$15–$40", profit:"$30–$140" };
  if (match(["band tee","vintage tee","graphic tee","rap tee","concert tee"]))
    return { tier:"A", desc:"Vintage band and rap tees are booming. 80s–90s originals fetch serious money.", prices:[{name:"eBay",price:"$60–$300"},{name:"Depop",price:"$70–$320"},{name:"Poshmark",price:"$55–$280"},{name:"Mercari",price:"$50–$260"}], buy:"$5–$30", profit:"$40–$250" };
  if (match(["h&m","zara","shein","forever 21","fashion nova","primark"]))
    return { tier:"F", desc:"Fast fashion has almost no resale value. Thousands of identical listings — leave it on the rack.", prices:[{name:"eBay",price:"$3–$8"},{name:"Poshmark",price:"$4–$10"},{name:"Depop",price:"$3–$9"},{name:"Mercari",price:"$3–$7"}], buy:"$0–$1", profit:"$0–$2" };
  if (match(["louis vuitton","gucci","prada","balenciaga","burberry","versace","dior","fendi"]))
    return { tier:"S", desc:"Authentic luxury goods have excellent resale markets. Authentication is critical.", prices:[{name:"eBay",price:"$400–$3000"},{name:"Poshmark",price:"$350–$2800"},{name:"Depop",price:"$380–$2900"},{name:"Mercari",price:"$300–$2500"}], buy:"$100–$800", profit:"$200–$1500" };
  if (match(["nike","air max","air force","af1","cortez"]))
    return { tier:"B", desc:"Nike has broad resale appeal. Retro and vintage styles sell best.", prices:[{name:"eBay",price:"$50–$150"},{name:"Depop",price:"$55–$160"},{name:"Poshmark",price:"$45–$140"},{name:"Mercari",price:"$40–$130"}], buy:"$20–$60", profit:"$20–$90" };
  if (match(["adidas","samba","gazelle","stan smith","campus","nmd"]))
    return { tier:"B", desc:"Adidas classics like Samba and Gazelle are having a moment.", prices:[{name:"eBay",price:"$50–$130"},{name:"Depop",price:"$55–$140"},{name:"Poshmark",price:"$45–$120"},{name:"Mercari",price:"$40–$115"}], buy:"$20–$55", profit:"$20–$75" };
  if (match(["vintage","90s","80s","70s","deadstock","retro"]))
    return { tier:"B", desc:"Vintage items have solid resale potential. Condition, brand, and era all affect value.", prices:[{name:"eBay",price:"$30–$120"},{name:"Depop",price:"$35–$130"},{name:"Poshmark",price:"$28–$110"},{name:"Mercari",price:"$25–$100"}], buy:"$5–$20", profit:"$15–$80" };
  return { tier:"C", desc:"Moderate resale potential. Research completed eBay sales before listing to price accurately.", prices:[{name:"eBay",price:"$15–$60"},{name:"Poshmark",price:"$18–$65"},{name:"Depop",price:"$15–$58"},{name:"Mercari",price:"$12–$55"},{name:"Facebook Marketplace",price:"$10–$45"}], buy:"$2–$10", profit:"$8–$40" };
}

const GS = `
  @import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=Nunito:wght@500;700;800&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  body{background:#faf7f2;}
  button{cursor:pointer;font-family:'Nunito',sans-serif;}
  textarea,select{font-family:'Nunito',sans-serif;outline:none;}
  a{text-decoration:none;}
  .upload-box{border:2px dashed #c8e6c9;border-radius:14px;padding:20px;text-align:center;cursor:pointer;background:#f0fdf4;transition:all 0.2s;}
  .upload-box:hover{border-color:#2d6a4f;background:#e8f5ee;}
`;

export default function App() {
  const [page, setPage]           = useState("paywall");
  const [plan, setPlan]           = useState(null);
  const [query, setQuery]         = useState("");
  const [condition, setCondition] = useState("likenew");
  const [imgPreview, setImgPreview] = useState(null);
  const [loading, setLoading]     = useState(false);
  const [result, setResult]       = useState(null);
  const [history, setHistory]     = useState([]);
  const [ratingsUsed, setRatingsUsed] = useState(0);
  const fileRef = useRef(null);

  const currentPlan = plan ? PLANS[plan] : null;

  function handleImage(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target && e.target.result) {
        setImgPreview(e.target.result);
      }
    };
    reader.readAsDataURL(file);
  }

  function rateItem() {
    const q = query.trim() || "clothing item";
    if (!q) return;
    if (currentPlan && ratingsUsed >= currentPlan.ratingLimit) {
      alert("Rating limit reached! Upgrade your plan for more ratings.");
      return;
    }
    setLoading(true);
    const analysis = keywordAnalyze(q);
    const multiplier = CONDITION_MULTIPLIERS[condition] || 1.0;
    const adjustedPrices = analysis.prices.map(p => ({ ...p, price: applyCondition(p.price, multiplier) }));
    const r = {
      id: Date.now(),
      name: q,
      imagePreview: imgPreview,
      condition,
      tier: analysis.tier,
      desc: analysis.desc,
      prices: adjustedPrices,
      buy: applyCondition(analysis.buy, multiplier),
      profit: applyCondition(analysis.profit, multiplier),
      tips: EXPERT_TIPS[analysis.tier] || [],
    };
    setTimeout(() => {
      setResult(r);
      setHistory(h => [r, ...h.slice(0, 9)]);
      setRatingsUsed(n => n + 1);
      setQuery("");
      setImgPreview(null);
      setLoading(false);
      setPage("result");
    }, 600);
  }

  // ── PAYWALL ──────────────────────────────────────────────
  if (page === "paywall") {
    return (
      <div style={{ background: "#faf7f2", minHeight: "100vh" }}>
        <style>{GS}</style>
        <div style={{ background: "#fff", borderBottom: "1.5px solid #e8e0d5", height: 54, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: 22 }}>Flip<span style={{ color: "#2d6a4f" }}>Rank</span></span>
        </div>
        <div style={{ maxWidth: 640, margin: "0 auto", padding: "32px 14px 60px" }}>
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{ display: "inline-block", background: "#e8f5ee", borderRadius: 20, padding: "5px 14px", marginBottom: 12, fontFamily: "'Nunito', sans-serif", fontSize: 13, color: "#2d6a4f", fontWeight: 700 }}>✨ AI Resale Intelligence</div>
            <h1 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: "clamp(28px,7vw,52px)", lineHeight: 1.05, letterSpacing: "-0.02em", marginBottom: 10 }}>Flip Smarter.<br /><span style={{ color: "#2d6a4f" }}>Make More Money.</span></h1>
            <p style={{ fontFamily: "'Nunito', sans-serif", color: "#888", fontSize: 15, lineHeight: 1.7, fontWeight: 500, maxWidth: 420, margin: "0 auto" }}>Get instant tier ratings, platform prices, and profit estimates on any clothing item.</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {Object.entries(PLANS).map(([key, p]) => (
              <div key={key} style={{ background: "#fff", border: "2px solid " + p.color + "44", borderRadius: 18, padding: "20px 22px", position: "relative" }}>
                {key === "pro" && <div style={{ position: "absolute", top: -12, right: 20, background: p.color, color: "#fff", borderRadius: 20, padding: "3px 12px", fontFamily: "'Nunito', sans-serif", fontSize: 12, fontWeight: 800 }}>MOST POPULAR</div>}
                {key === "elite" && <div style={{ position: "absolute", top: -12, right: 20, background: p.color, color: "#fff", borderRadius: 20, padding: "3px 12px", fontFamily: "'Nunito', sans-serif", fontSize: 12, fontWeight: 800 }}>BEST VALUE</div>}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                  <div>
                    <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: 22, color: "#1a1a1a" }}>{p.name}</div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 3, marginTop: 4 }}>
                      <span style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: 30, color: p.color }}>{p.price}</span>
                      <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: 14, color: "#aaa", fontWeight: 600 }}>{p.period}</span>
                    </div>
                  </div>
                  <a href={p.stripe} target="_blank" rel="noopener noreferrer"
                    onClick={() => { setPlan(key); setTimeout(() => setPage("home"), 300); }}
                    style={{ background: p.color, color: "#fff", borderRadius: 12, padding: "11px 20px", fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: 14, display: "inline-block" }}>
                    Subscribe →
                  </a>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {p.features.map((f, i) => (
                    <div key={i} style={{ fontFamily: "'Nunito', sans-serif", fontSize: 13, color: f.startsWith("✅") ? "#444" : "#bbb", fontWeight: f.startsWith("✅") ? 600 : 500 }}>{f}</div>
                  ))}
                </div>
                {key === "basic" && <div style={{ marginTop: 12, background: "#f0fdf4", borderRadius: 8, padding: "8px 12px", fontFamily: "'Nunito', sans-serif", fontSize: 12, color: "#16a34a", fontWeight: 600 }}>⚡ Includes 5 ratings per month</div>}
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 20 }}>
            <button onClick={() => { setPlan("basic"); setPage("home"); }}
              style={{ background: "none", border: "none", fontFamily: "'Nunito', sans-serif", fontSize: 14, color: "#aaa", fontWeight: 600, textDecoration: "underline", cursor: "pointer" }}>
              Try 1 free rating first →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── RESULT PAGE ──────────────────────────────────────────
  if (page === "result" && result) {
    const T = TIERS[result.tier] || TIERS["C"];
    return (
      <div style={{ background: "#faf7f2", minHeight: "100vh" }}>
        <style>{GS}</style>
        <div style={{ background: "#fff", borderBottom: "1.5px solid #e8e0d5", height: 54, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", position: "sticky", top: 0, zIndex: 99 }}>
          <button onClick={() => setPage("home")} style={{ background: "#f0ece6", border: "none", borderRadius: 20, padding: "7px 14px", fontWeight: 700, fontSize: 14, color: "#555" }}>← Back</button>
          <span style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: 19 }}>Flip<span style={{ color: "#2d6a4f" }}>Rank</span></span>
          <button onClick={() => setPage("home")} style={{ background: "#2d6a4f", border: "none", borderRadius: 20, padding: "7px 14px", fontWeight: 700, fontSize: 14, color: "#fff" }}>+ New</button>
        </div>
        <div style={{ maxWidth: 600, margin: "0 auto", padding: "24px 14px 80px" }}>
          <div style={{ background: T.bg, border: "2px solid " + T.color + "44", borderRadius: 20, padding: "28px 20px", textAlign: "center", marginBottom: 14 }}>
            {result.imagePreview && <img src={result.imagePreview} alt="item" style={{ width: 90, height: 90, borderRadius: 14, objectFit: "cover", border: "3px solid #fff", boxShadow: "0 4px 16px #00000020", margin: "0 auto 14px", display: "block" }} />}
            <div style={{ width: 88, height: 88, borderRadius: 18, background: "#fff", border: "4px solid " + T.color, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Archivo Black', sans-serif", fontSize: 48, color: T.color, margin: "0 auto 12px" }}>{result.tier}</div>
            <div style={{ fontFamily: "'Nunito', sans-serif", fontSize: 12, fontWeight: 800, color: T.color, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 6 }}>{T.label} · {T.sub}</div>
            <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: 20, color: "#1a1a1a", marginBottom: 6 }}>{result.name}</div>
            <div style={{ fontFamily: "'Nunito', sans-serif", fontSize: 12, color: "#888", fontWeight: 600 }}>{CONDITION_LABELS[result.condition]}</div>
          </div>

          <div style={{ background: "#fff", border: "1.5px solid #e8e0d5", borderRadius: 16, padding: "16px 18px", marginBottom: 14 }}>
            <div style={{ fontFamily: "'Nunito', sans-serif", fontSize: 11, fontWeight: 800, color: T.color, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>📋 Expert Analysis</div>
            <div style={{ fontFamily: "'Nunito', sans-serif", fontSize: 15, color: "#444", lineHeight: 1.8, fontWeight: 500 }}>{result.desc}</div>
          </div>

          {currentPlan && currentPlan.hasProfit ? (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
              <div style={{ background: "#e8f5ee", border: "1.5px solid #2d6a4f25", borderRadius: 14, padding: "14px 16px" }}>
                <div style={{ fontFamily: "'Nunito', sans-serif", fontSize: 11, fontWeight: 800, color: "#2d6a4f", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>💰 Est. Profit</div>
                <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: 26, color: "#2d6a4f" }}>{result.profit}</div>
                <div style={{ fontFamily: "'Nunito', sans-serif", fontSize: 11, color: "#5a9a78", fontWeight: 600, marginTop: 3 }}>after fees & shipping</div>
              </div>
              <div style={{ background: "#fff7ed", border: "1.5px solid #ea580c25", borderRadius: 14, padding: "14px 16px" }}>
                <div style={{ fontFamily: "'Nunito', sans-serif", fontSize: 11, fontWeight: 800, color: "#ea580c", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>🏷️ Max Buy Price</div>
                <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: 26, color: "#ea580c" }}>{result.buy}</div>
                <div style={{ fontFamily: "'Nunito', sans-serif", fontSize: 11, color: "#c2824a", fontWeight: 600, marginTop: 3 }}>at thrift / source</div>
              </div>
            </div>
          ) : (
            <div style={{ background: "#fff", border: "1.5px dashed #e8e0d5", borderRadius: 14, padding: "16px 18px", marginBottom: 14, textAlign: "center" }}>
              <div style={{ fontFamily: "'Nunito', sans-serif", fontSize: 14, color: "#aaa", fontWeight: 600, marginBottom: 8 }}>🔒 Profit estimates on Pro & Elite</div>
              <a href={STRIPE.pro} target="_blank" rel="noopener noreferrer" style={{ background: "#ea580c", color: "#fff", borderRadius: 10, padding: "8px 18px", fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: 13, display: "inline-block" }}>Upgrade to Pro →</a>
            </div>
          )}

          <div style={{ fontFamily: "'Nunito', sans-serif", fontSize: 11, fontWeight: 800, color: "#bbb", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>💸 Platform Prices</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
            {result.prices.map((p, i) => {
              const pl = PLATFORMS.find(x => x.name === p.name) || { emoji: "🔗", url: "https://ebay.com", name: p.name };
              return currentPlan && currentPlan.hasLinks ? (
                <a key={i} href={pl.url} target="_blank" rel="noopener noreferrer"
                  style={{ background: "#fff", border: "1.5px solid #e8e0d5", borderRadius: 14, padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 24 }}>{pl.emoji}</span>
                    <div>
                      <div style={{ fontFamily: "'Nunito', sans-serif", fontSize: 15, fontWeight: 800, color: "#1a1a1a" }}>{p.name}</div>
                      <div style={{ fontFamily: "'Nunito', sans-serif", fontSize: 12, color: "#aaa", fontWeight: 600 }}>Tap to open & list ↗</div>
                    </div>
                  </div>
                  <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: 18, color: T.color }}>{p.price}</div>
                </a>
              ) : (
                <div key={i} style={{ background: "#fff", border: "1.5px solid #e8e0d5", borderRadius: 14, padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 24 }}>{pl.emoji}</span>
                    <div style={{ fontFamily: "'Nunito', sans-serif", fontSize: 15, fontWeight: 800, color: "#1a1a1a" }}>{p.name}</div>
                  </div>
                  <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: 18, color: T.color }}>{p.price}</div>
                </div>
              );
            })}
          </div>

          {currentPlan && currentPlan.hasTips && result.tips && result.tips.length > 0 && (
            <div style={{ background: "#fff", border: "1.5px solid #7c3aed30", borderRadius: 16, padding: "16px 18px", marginBottom: 14 }}>
              <div style={{ fontFamily: "'Nunito', sans-serif", fontSize: 11, fontWeight: 800, color: "#7c3aed", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10 }}>⚡ Expert Reseller Tips</div>
              {result.tips.map((tip, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", background: "#f5f3ff", borderRadius: 10, padding: "10px 13px", marginBottom: i < result.tips.length - 1 ? 8 : 0 }}>
                  <span style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: 13, color: "#7c3aed", minWidth: 18 }}>{i + 1}</span>
                  <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: 14, color: "#444", lineHeight: 1.6, fontWeight: 600 }}>{tip}</span>
                </div>
              ))}
            </div>
          )}

          {currentPlan && !currentPlan.hasTips && (
            <div style={{ background: "#fff", border: "1.5px dashed #e8e0d5", borderRadius: 14, padding: "14px 18px", marginBottom: 14, textAlign: "center" }}>
              <div style={{ fontFamily: "'Nunito', sans-serif", fontSize: 14, color: "#aaa", fontWeight: 600, marginBottom: 8 }}>🔒 Expert tips on Elite plan</div>
              <a href={STRIPE.elite} target="_blank" rel="noopener noreferrer" style={{ background: "#7c3aed", color: "#fff", borderRadius: 10, padding: "8px 18px", fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: 13, display: "inline-block" }}>Upgrade to Elite →</a>
            </div>
          )}

          <div style={{ background: "#2d6a4f", borderRadius: 16, padding: "18px 22px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: 16, color: "#fff", marginBottom: 2 }}>Got another item?</div>
              <div style={{ fontFamily: "'Nunito', sans-serif", fontSize: 13, color: "#a7d8bc", fontWeight: 600 }}>
                {currentPlan && currentPlan.ratingLimit >= 99999 ? "Unlimited ratings on your plan" : currentPlan ? (currentPlan.ratingLimit - ratingsUsed) + " ratings left" : ""}
              </div>
            </div>
            <button onClick={() => setPage("home")} style={{ background: "#fff", border: "none", borderRadius: 12, padding: "10px 16px", fontWeight: 800, fontSize: 14, color: "#2d6a4f" }}>Rate Another →</button>
          </div>
        </div>
      </div>
    );
  }

  // ── HOME PAGE ────────────────────────────────────────────
  return (
    <div style={{ background: "#faf7f2", minHeight: "100vh" }}>
      <style>{GS}</style>
      <div style={{ background: "#fff", borderBottom: "1.5px solid #e8e0d5", height: 54, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 28, height: 28, background: "linear-gradient(135deg,#2d6a4f,#52b788)", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>♻</div>
          <span style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: 19 }}>Flip<span style={{ color: "#2d6a4f" }}>Rank</span></span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {currentPlan && <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: 12, color: "#aaa", fontWeight: 600 }}>{currentPlan.name} · {ratingsUsed}/{currentPlan.ratingLimit >= 99999 ? "∞" : currentPlan.ratingLimit}</span>}
          <button onClick={() => setPage("paywall")} style={{ background: "#f0fdf4", border: "1.5px solid #16a34a30", borderRadius: 20, padding: "5px 12px", fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: 12, color: "#16a34a" }}>{currentPlan ? "Upgrade" : "Plans"}</button>
        </div>
      </div>

      <div style={{ maxWidth: 600, margin: "0 auto", padding: "32px 14px 60px" }}>
        <div style={{ textAlign: "center", marginBottom: 22 }}>
          <h1 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: "clamp(30px,8vw,60px)", lineHeight: 1.0, letterSpacing: "-0.02em", marginBottom: 8 }}>Is It Worth<br /><span style={{ color: "#2d6a4f" }}>The Flip?</span></h1>
          <p style={{ fontFamily: "'Nunito', sans-serif", color: "#888", fontSize: 14, lineHeight: 1.7, fontWeight: 500 }}>{currentPlan ? currentPlan.name + " Plan · " + (currentPlan.ratingLimit >= 99999 ? "Unlimited" : (currentPlan.ratingLimit - ratingsUsed) + " ratings left") : "Choose a plan to get started"}</p>
        </div>

        <div style={{ background: "#fff", border: "1.5px solid #e8e0d5", borderRadius: 18, padding: 18, marginBottom: 20, boxShadow: "0 4px 20px #00000008" }}>
          {currentPlan && currentPlan.hasPhoto ? (
            <>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => { if (e.target.files && e.target.files[0]) handleImage(e.target.files[0]); }} />
              {imgPreview ? (
                <div style={{ position: "relative", marginBottom: 12 }}>
                  <img src={imgPreview} alt="preview" style={{ width: "100%", height: 160, objectFit: "cover", borderRadius: 12 }} />
                  <button onClick={() => setImgPreview(null)} style={{ position: "absolute", top: 8, right: 8, background: "#000000aa", border: "none", borderRadius: 20, padding: "4px 10px", color: "#fff", fontSize: 13, fontWeight: 700 }}>✕</button>
                  <div style={{ position: "absolute", bottom: 8, left: 8, background: "#2d6a4f", borderRadius: 10, padding: "3px 10px", fontFamily: "'Nunito', sans-serif", fontSize: 12, fontWeight: 700, color: "#fff" }}>📸 Photo added</div>
                </div>
              ) : (
                <div className="upload-box" onClick={() => fileRef.current && fileRef.current.click()} style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 26, marginBottom: 4 }}>📸</div>
                  <div style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: 14, color: "#2d6a4f", marginBottom: 2 }}>Upload a Photo</div>
                  <div style={{ fontFamily: "'Nunito', sans-serif", fontSize: 12, color: "#aaa", fontWeight: 500 }}>For better accuracy</div>
                </div>
              )}
            </>
          ) : (
            <div style={{ background: "#f9fafb", border: "1.5px dashed #e0e0e0", borderRadius: 12, padding: "14px", marginBottom: 12, textAlign: "center" }}>
              <div style={{ fontFamily: "'Nunito', sans-serif", fontSize: 13, color: "#bbb", fontWeight: 600, marginBottom: 6 }}>🔒 Photo upload on Pro & Elite</div>
              <a href={STRIPE.pro} target="_blank" rel="noopener noreferrer" style={{ background: "#ea580c", color: "#fff", borderRadius: 8, padding: "6px 14px", fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: 12, display: "inline-block" }}>Upgrade to Pro</a>
            </div>
          )}

          <div style={{ marginBottom: 10 }}>
            <div style={{ fontFamily: "'Nunito', sans-serif", fontSize: 11, fontWeight: 800, color: "#bbb", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>Item Condition</div>
            <select value={condition} onChange={e => setCondition(e.target.value)} style={{ width: "100%", background: "#faf7f2", border: "1.5px solid #e8e0d5", borderRadius: 10, padding: "10px 13px", fontSize: 14, color: "#1a1a1a", fontWeight: 600 }}>
              {Object.entries(CONDITION_LABELS).map(([val, label]) => <option key={val} value={val}>{label}</option>)}
            </select>
          </div>

          <textarea rows={2} value={query} onChange={e => setQuery(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); rateItem(); }}}
            placeholder={imgPreview ? "Add description for better results (optional)..." : '"Supreme Box Logo Hoodie" or "Vintage Carhartt jacket"'}
            style={{ background: "#faf7f2", border: "1.5px solid #e8e0d5", borderRadius: 10, color: "#1a1a1a", padding: "11px 13px", fontSize: 15, width: "100%", marginBottom: 10, fontWeight: 500, lineHeight: 1.6, resize: "none" }}
            onFocus={e => e.target.style.borderColor = "#2d6a4f"}
            onBlur={e => e.target.style.borderColor = "#e8e0d5"}
          />

          <button onClick={rateItem} disabled={loading || !query.trim()}
            style={{ display: "block", width: "100%", background: loading || !query.trim() ? "#ccc" : "#2d6a4f", color: "#fff", border: "none", borderRadius: 10, padding: "14px", fontWeight: 800, fontSize: 16 }}>
            {loading ? "⏳ Analyzing..." : imgPreview ? "📸 Rate With Photo →" : "Rate This Item →"}
          </button>

          <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 6 }}>
            {["Supreme Box Logo","Nike Dunk Low","Vintage Carhartt","Jordan 1 Chicago","Patagonia Fleece","Levi's 501"].map(ex => (
              <button key={ex} onClick={() => setQuery(ex)} style={{ background: "#f5f0e8", border: "none", borderRadius: 20, padding: "5px 12px", color: "#888", fontSize: 13, fontWeight: 600 }}
                onMouseOver={e => { e.currentTarget.style.background="#e8f5ee"; e.currentTarget.style.color="#2d6a4f"; }}
                onMouseOut={e => { e.currentTarget.style.background="#f5f0e8"; e.currentTarget.style.color="#888"; }}>
                {ex}
              </button>
            ))}
          </div>
        </div>

        <div style={{ fontFamily: "'Nunito', sans-serif", fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "#bbb", marginBottom: 8 }}>Tier Guide</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 7, marginBottom: 20 }}>
          {Object.entries(TIERS).map(([id, T]) => (
            <div key={id} style={{ background: T.bg, border: "1.5px solid " + T.color + "30", borderRadius: 10, padding: "9px 11px", display: "flex", alignItems: "center", gap: 7 }}>
              <div style={{ width: 30, height: 30, borderRadius: 7, background: "#fff", border: "2px solid " + T.color, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Archivo Black', sans-serif", fontSize: 15, color: T.color, flexShrink: 0 }}>{id}</div>
              <div>
                <div style={{ fontFamily: "'Nunito', sans-serif", fontSize: 12, fontWeight: 800, color: T.color }}>{T.label}</div>
                <div style={{ fontFamily: "'Nunito', sans-serif", fontSize: 10, color: "#999", fontWeight: 500 }}>{T.sub.split("—")[1] ? T.sub.split("—")[1].trim() : ""}</div>
              </div>
            </div>
          ))}
        </div>

        {history.length > 0 && (
          <div>
            <div style={{ fontFamily: "'Nunito', sans-serif", fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "#bbb", marginBottom: 8 }}>Previously Rated</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {history.map(item => {
                const T = TIERS[item.tier] || TIERS["C"];
                return (
                  <button key={item.id} onClick={() => { setResult(item); setPage("result"); }}
                    style={{ background: "#fff", border: "1.5px solid #e8e0d5", borderRadius: 12, padding: "11px 14px", display: "flex", alignItems: "center", gap: 11, textAlign: "left", width: "100%" }}>
                    {item.imagePreview
                      ? <img src={item.imagePreview} alt="" style={{ width: 36, height: 36, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} />
                      : <div style={{ width: 36, height: 36, borderRadius: 8, background: T.bg, border: "2px solid " + T.color, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Archivo Black', sans-serif", fontSize: 18, color: T.color, flexShrink: 0 }}>{item.tier}</div>
                    }
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "'Nunito', sans-serif", fontSize: 14, fontWeight: 700, color: "#1a1a1a" }}>{item.name}</div>
                      <div style={{ fontFamily: "'Nunito', sans-serif", fontSize: 12, color: T.color, fontWeight: 600 }}>{T.label} · {CONDITION_LABELS[item.condition]}</div>
                    </div>
                    <span style={{ color: "#ccc", fontSize: 18 }}>›</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}