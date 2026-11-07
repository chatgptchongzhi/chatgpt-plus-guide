import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const base = "/chatgpt-plus-guide/";
const articles = {
  recharge: ["ChatGPT充值方式与套餐选择", ""],
  membership: ["ChatGPT会员等级与价格对比", "chatgpt-membership-levels-2026/"],
  purchase: ["GPT会员开通、价格与付款指南", "guides/gpt-membership-price-purchase-2026/"],
  payment: ["ChatGPT应用内购买不可用解决方法", "guides/chatgpt-in-app-purchase-unavailable-pro-5x/"],
  safety: ["ChatGPT Plus代充与付款风险", "chatgpt-plus-safety/"],
  files: ["ChatGPT Plus文件上传限制", "chatgpt-plus-file-upload-limits-2026.html"],
  codex: ["ChatGPT Plus会员如何使用Codex", "chatgpt-plus-codex-how-to-use.html"],
  codexPay: ["ChatGPT Plus与Codex订阅教程", "gpt6-plus-codex.html"],
  ecommerce: ["ChatGPT和Codex在跨境电商中的区别", "chatgpt-vs-codex-cross-border-ecommerce/"],
  register: ["ChatGPT注册与验证码问题教程", "chatgpt-registration-guide-2026/"],
  claudeRisk: ["Claude Pro授权Claude Code的风险", "guides/claude-pro-claude-code-ban-risk/"],
  claudeEffort: ["Claude Code Ultracode与Max Effort对比", "guides/claude-code-ultracode-vs-max-effort/"],
  muse: ["Muse AI是什么及使用方法", "guides/what-is-muse-ai/"],
  museSignup: ["Muse AI注册与年龄认证排查", "guides/muse-ai-signup-age-verification/"],
  grok: ["Grok Bot安装与使用教程", "guides/how-to-use-grok-bot/"],
  googleFamily: ["Google AI Pro家庭共享教程", "guides/google-ai-pro-family-sharing/"],
  telegram: ["iPhone Telegram敏感内容设置", "guides/telegram-iphone-sensitive-content/"],
};

const related = {
  "index.html": ["membership", "purchase", "payment"],
  "gpt6-plus-codex.html": ["codex", "membership", "purchase"],
  "chatgpt-plus-codex-how-to-use.html": ["codexPay", "membership", "ecommerce"],
  "chatgpt-plus-file-upload-limits-2026.html": ["membership", "purchase", "codex"],
  "chatgpt-plus-safety/index.html": ["payment", "purchase", "membership"],
  "chatgpt-vs-codex-cross-border-ecommerce/index.html": ["codex", "codexPay", "claudeEffort"],
  "chatgpt-membership-levels-2026/index.html": ["purchase", "payment", "codex"],
  "guides/gpt-membership-price-purchase-2026/index.html": ["membership", "payment", "safety"],
  "chatgpt-registration-guide-2026/index.html": ["purchase", "membership", "payment"],
  "guides/chatgpt-in-app-purchase-unavailable-pro-5x/index.html": ["purchase", "membership", "safety"],
  "guides/claude-pro-claude-code-ban-risk/index.html": ["claudeEffort", "codex", "ecommerce"],
  "guides/what-is-muse-ai/index.html": ["museSignup", "grok", "googleFamily"],
  "guides/claude-code-ultracode-vs-max-effort/index.html": ["claudeRisk", "codex", "ecommerce"],
  "guides/google-ai-pro-family-sharing/index.html": ["muse", "museSignup", "grok"],
  "guides/how-to-use-grok-bot/index.html": ["muse", "museSignup", "googleFamily"],
  "guides/muse-ai-signup-age-verification/index.html": ["muse", "grok", "googleFamily"],
  "guides/telegram-iphone-sensitive-content/index.html": ["register", "museSignup", "googleFamily"],
};

for (const [path, keys] of Object.entries(related)) {
  const file = resolve(root, path);
  let html = readFileSync(file, "utf8");
  const list = keys.map((key) => {
    const [title, href] = articles[key];
    return `<li><a href="${base}${href}">${title}</a></li>`;
  }).join("");
  const block = `<!-- related-articles:start --><section class="related-articles" aria-labelledby="related-articles-heading"><h2 id="related-articles-heading">相关文章</h2><ul>${list}</ul></section><!-- related-articles:end -->`;
  const existing = /<!-- related-articles:start -->[\s\S]*?<!-- related-articles:end -->/i;
  if (existing.test(html)) html = html.replace(existing, block);
  else html = html.replace(/<\/article>(?![\s\S]*<\/article>)/i, `${block}</article>`);
  writeFileSync(file, html, "utf8");
}
