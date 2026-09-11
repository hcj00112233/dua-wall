// Supabase 未配置时走 API_BASE 后端（本机服务 + cloudflared 隧道）。
window.DUA_CONFIG = {
  SUPABASE_URL: "",
  SUPABASE_ANON_KEY: "",
  API_BASE: "https://dear-chrome-miracle-fine.trycloudflare.com",
};
