globalThis.__timing__.logStart('Load chunks/build/dashboard-BAYempWn');import { u as useFetch } from '../virtual/entry.mjs';
import { N as NuxtLink } from './nuxt-link-EM4aj9FS.mjs';
import { _ as _sfc_main } from './Icon-1cxOBUbV.mjs';
import { u as usePersian } from './usePersian-C5t6sT6J.mjs';
import { L as LoadingState_default } from './LoadingState-BO66Wa2p.mjs';
import { defineComponent, mergeProps, unref, withCtx, createVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderClass, ssrRenderStyle } from 'vue/server-renderer';
import 'nostics';
import 'nostics/formatters/ansi';
import 'unhead/utils';
import '../routes/renderer.mjs';
import '../_/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import '@iconify/utils';
import 'consola';
import 'unhead/server';
import 'unhead/legacy';
import 'unhead/plugins';
import 'vue-bundle-renderer/runtime';
import 'devalue';
import 'vue-router';
import '@vue/shared';
import '@iconify/vue';
import 'tailwindcss/colors';
import './components-BoJy0Hie.mjs';
import '@iconify/utils/lib/css/icon';

//#region app/pages/dashboard.vue?vue&type=script&setup=true&lang.ts
var dashboard_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "dashboard",
	__ssrInlineRender: true,
	setup(__props) {
		const { money, date } = usePersian();
		const { data, pending, error, refresh } = useFetch("/api/dashboard", {
			credentials: "include",
			lazy: true
		}, "$XZQ97xtgUa");
		return (_ctx, _push, _parent, _attrs) => {
			const _component_UIcon = _sfc_main;
			const _component_SharedLoadingState = LoadingState_default;
			const _component_NuxtLink = NuxtLink;
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-5" }, _attrs))}><div class="flex items-center justify-between gap-3"><div><p class="text-sm font-semibold text-slate-500">نمای کلی امروز</p><h1 class="text-2xl font-black text-slate-950">داشبورد</h1></div><button class="btn-secondary min-h-11 px-3 text-sm">`);
			_push(ssrRenderComponent(_component_UIcon, {
				name: "i-lucide-refresh-cw",
				class: "btn-icon"
			}, null, _parent));
			_push(`<span>به‌روزرسانی</span></button></div>`);
			if (unref(pending)) _push(ssrRenderComponent(_component_SharedLoadingState, { title: "در حال آماده‌سازی داشبورد" }, null, _parent));
			else if (unref(error)) _push(`<p class="mobile-card border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">دریافت داشبورد ناموفق بود.</p>`);
			else if (unref(data)) {
				_push(`<!--[--><section class="finance-hero overflow-hidden rounded-xl p-5 text-white"><div class="text-sm text-slate-300">موجودی کل</div><div class="money-value mt-3 text-3xl font-black leading-tight">${ssrInterpolate(unref(money)(unref(data).summary.totalBalanceMinor))}</div><div class="mt-5 grid grid-cols-2 gap-3 text-sm"><div class="rounded-lg bg-white/10 p-3"><div class="text-slate-300">درآمد ماه</div><div class="money-value mt-1 font-bold text-emerald-100">${ssrInterpolate(unref(money)(unref(data).summary.monthlyIncomeMinor))}</div></div><div class="rounded-lg bg-white/10 p-3"><div class="text-slate-300">هزینه ماه</div><div class="money-value mt-1 font-bold text-rose-100">${ssrInterpolate(unref(money)(unref(data).summary.monthlyExpenseMinor))}</div></div></div></section><section class="grid grid-cols-1 gap-3 sm:grid-cols-3">`);
				_push(ssrRenderComponent(_component_NuxtLink, {
					to: "/transactions",
					class: "btn-primary"
				}, {
					default: withCtx((_, _push, _parent, _scopeId) => {
						if (_push) {
							_push(ssrRenderComponent(_component_UIcon, {
								name: "i-lucide-plus",
								class: "btn-icon"
							}, null, _parent, _scopeId));
							_push(`<span${_scopeId}>ثبت تراکنش</span>`);
						} else return [createVNode(_component_UIcon, {
							name: "i-lucide-plus",
							class: "btn-icon"
						}), createVNode("span", null, "ثبت تراکنش")];
					}),
					_: 1
				}, _parent));
				_push(ssrRenderComponent(_component_NuxtLink, {
					to: "/accounts",
					class: "btn-secondary"
				}, {
					default: withCtx((_, _push, _parent, _scopeId) => {
						if (_push) {
							_push(ssrRenderComponent(_component_UIcon, {
								name: "i-lucide-wallet-cards",
								class: "btn-icon"
							}, null, _parent, _scopeId));
							_push(`<span${_scopeId}>مدیریت حساب‌ها</span>`);
						} else return [createVNode(_component_UIcon, {
							name: "i-lucide-wallet-cards",
							class: "btn-icon"
						}), createVNode("span", null, "مدیریت حساب‌ها")];
					}),
					_: 1
				}, _parent));
				_push(ssrRenderComponent(_component_NuxtLink, {
					to: "/reports",
					class: "btn-secondary"
				}, {
					default: withCtx((_, _push, _parent, _scopeId) => {
						if (_push) {
							_push(ssrRenderComponent(_component_UIcon, {
								name: "i-lucide-chart-no-axes-combined",
								class: "btn-icon"
							}, null, _parent, _scopeId));
							_push(`<span${_scopeId}>دیدن گزارش‌ها</span>`);
						} else return [createVNode(_component_UIcon, {
							name: "i-lucide-chart-no-axes-combined",
							class: "btn-icon"
						}), createVNode("span", null, "دیدن گزارش‌ها")];
					}),
					_: 1
				}, _parent));
				_push(`</section><section class="mobile-card p-4"><div class="flex items-center justify-between gap-3"><h2 class="font-bold text-slate-950">جریان نقدی ماه</h2><span class="money-value rounded-full bg-teal-50 px-3 py-1 text-sm font-bold text-teal-800">${ssrInterpolate(unref(money)(unref(data).summary.netCashFlowMinor))}</span></div></section><section class="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]"><div class="mobile-card p-4"><div class="mb-2 flex items-center justify-between"><h2 class="font-bold">تراکنش‌های اخیر</h2>`);
				_push(ssrRenderComponent(_component_NuxtLink, {
					to: "/transactions",
					class: "inline-flex items-center gap-1 text-sm font-semibold text-cyan-700"
				}, {
					default: withCtx((_, _push, _parent, _scopeId) => {
						if (_push) {
							_push(ssrRenderComponent(_component_UIcon, {
								name: "i-lucide-list",
								class: "size-4"
							}, null, _parent, _scopeId));
							_push(`<span${_scopeId}>همه</span>`);
						} else return [createVNode(_component_UIcon, {
							name: "i-lucide-list",
							class: "size-4"
						}), createVNode("span", null, "همه")];
					}),
					_: 1
				}, _parent));
				_push(`</div><div class="divide-y divide-slate-100"><!--[-->`);
				ssrRenderList(unref(data).recentTransactions, (item) => {
					_push(`<div class="flex min-h-16 items-center justify-between gap-3 py-3"><div class="min-w-0"><div class="truncate font-medium">${ssrInterpolate(item.description || item.categoryName)}</div><div class="mt-1 truncate text-xs text-slate-500">${ssrInterpolate(item.accountName)} · ${ssrInterpolate(unref(date)(item.date))}</div></div><div class="${ssrRenderClass([item.type === "income" ? "text-emerald-700" : "text-rose-700", "money-value shrink-0 text-sm font-black"])}">${ssrInterpolate(item.type === "income" ? "+" : "-")}${ssrInterpolate(unref(money)(item.amountMinor))}</div></div>`);
				});
				_push(`<!--]-->`);
				if (!unref(data).recentTransactions.length) _push(`<p class="py-8 text-center text-sm text-slate-500">هنوز تراکنشی ثبت نشده است.</p>`);
				else _push(`<!---->`);
				_push(`</div></div><div class="mobile-card p-4"><h2 class="font-bold">هزینه بر اساس دسته</h2><div class="mt-4 space-y-4"><!--[-->`);
				ssrRenderList(unref(data).categoryBreakdown, (item) => {
					_push(`<div><div class="mb-2 flex justify-between gap-3 text-sm"><span class="truncate">${ssrInterpolate(item.categoryName)}</span><span class="money-value shrink-0 font-bold">${ssrInterpolate(unref(money)(item.amountMinor))}</span></div><div class="h-2.5 rounded-full bg-slate-100"><div class="h-2.5 rounded-full bg-teal-600" style="${ssrRenderStyle({ width: `${Math.min(100, Number(item.amountMinor) / 1e6)}%` })}"></div></div></div>`);
				});
				_push(`<!--]-->`);
				if (!unref(data).categoryBreakdown.length) _push(`<p class="py-8 text-center text-sm text-slate-500">داده‌ای برای ماه جاری وجود ندارد.</p>`);
				else _push(`<!---->`);
				_push(`</div></div></section><!--]-->`);
			} else _push(`<!---->`);
			_push(`</div>`);
		};
	}
});
//#endregion
//#region app/pages/dashboard.vue
var _sfc_setup = dashboard_vue_vue_type_script_setup_true_lang_default.setup;
dashboard_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/dashboard.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var dashboard_default = dashboard_vue_vue_type_script_setup_true_lang_default;

export { dashboard_default as default };;globalThis.__timing__.logEnd('Load chunks/build/dashboard-BAYempWn');
//# sourceMappingURL=dashboard-BAYempWn.mjs.map
