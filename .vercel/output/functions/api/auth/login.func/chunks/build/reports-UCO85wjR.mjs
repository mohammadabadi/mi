globalThis.__timing__.logStart('Load chunks/build/reports-UCO85wjR');import { u as useFetch } from '../virtual/entry.mjs';
import { u as usePersian } from './usePersian-C5t6sT6J.mjs';
import { L as LoadingState_default } from './LoadingState-BO66Wa2p.mjs';
import { defineComponent, computed, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrInterpolate } from 'vue/server-renderer';
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
import './Icon-1cxOBUbV.mjs';
import './components-BoJy0Hie.mjs';
import '@iconify/utils/lib/css/icon';

//#region app/pages/reports/index.vue?vue&type=script&setup=true&lang.ts
var index_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "index",
	__ssrInlineRender: true,
	setup(__props) {
		const { money } = usePersian();
		const { data: monthly, pending: monthlyPending } = useFetch("/api/reports/monthly", {
			credentials: "include",
			lazy: true
		}, "$Ta5Nb_sPGQ");
		const { data: expenses, pending: expensesPending } = useFetch("/api/reports/expenses", {
			credentials: "include",
			lazy: true
		}, "$LwP3VdyIYX");
		const { data: income, pending: incomePending } = useFetch("/api/reports/income", {
			credentials: "include",
			lazy: true
		}, "$bZfhdoIUKB");
		const pending = computed(() => monthlyPending.value || expensesPending.value || incomePending.value);
		return (_ctx, _push, _parent, _attrs) => {
			const _component_SharedLoadingState = LoadingState_default;
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-5" }, _attrs))}><div><p class="text-sm font-semibold text-slate-500">تحلیل درآمد و هزینه</p><h1 class="text-2xl font-black text-slate-950">گزارش‌ها</h1></div>`);
			if (unref(pending)) _push(ssrRenderComponent(_component_SharedLoadingState, {
				title: "در حال ساخت گزارش‌ها",
				rows: 4
			}, null, _parent));
			else {
				_push(`<section class="mobile-card p-4"><h2 class="font-bold">درآمد، هزینه و خالص ماهانه</h2><div class="mt-4 space-y-3 md:hidden"><!--[-->`);
				ssrRenderList(unref(monthly)?.rows, (row) => {
					_push(`<article class="rounded-xl border border-slate-100 bg-slate-50 p-4"><div class="ltr text-right text-sm font-bold text-slate-700">${ssrInterpolate(row.month)}</div><div class="mt-3 grid grid-cols-3 gap-2 text-xs"><div><div class="text-slate-500">درآمد</div><div class="money-value mt-1 font-bold text-emerald-700">${ssrInterpolate(unref(money)(row.incomeMinor))}</div></div><div><div class="text-slate-500">هزینه</div><div class="money-value mt-1 font-bold text-rose-700">${ssrInterpolate(unref(money)(row.expenseMinor))}</div></div><div><div class="text-slate-500">خالص</div><div class="money-value mt-1 font-bold text-slate-950">${ssrInterpolate(unref(money)(row.netMinor))}</div></div></div></article>`);
				});
				_push(`<!--]--></div><div class="mt-4 hidden overflow-auto md:block"><table class="w-full min-w-[620px] text-sm"><thead class="text-slate-500"><tr><th class="p-3 text-right">ماه</th><th class="p-3 text-right">درآمد</th><th class="p-3 text-right">هزینه</th><th class="p-3 text-right">خالص</th></tr></thead><tbody class="divide-y divide-slate-100"><!--[-->`);
				ssrRenderList(unref(monthly)?.rows, (row) => {
					_push(`<tr><td class="p-3 ltr text-right">${ssrInterpolate(row.month)}</td><td class="money-value p-3 text-emerald-700">${ssrInterpolate(unref(money)(row.incomeMinor))}</td><td class="money-value p-3 text-rose-700">${ssrInterpolate(unref(money)(row.expenseMinor))}</td><td class="money-value p-3 font-bold">${ssrInterpolate(unref(money)(row.netMinor))}</td></tr>`);
				});
				_push(`<!--]--></tbody></table></div>`);
				if (!unref(monthly)?.rows?.length) _push(`<p class="p-8 text-center text-sm text-slate-500">گزارشی وجود ندارد.</p>`);
				else _push(`<!---->`);
				_push(`</section>`);
			}
			if (!unref(pending)) {
				_push(`<section class="grid gap-4 lg:grid-cols-2"><div class="mobile-card p-4"><h2 class="font-bold">هزینه بر اساس دسته</h2><div class="mt-4 space-y-3"><!--[-->`);
				ssrRenderList(unref(expenses)?.rows, (row) => {
					_push(`<div class="flex min-h-12 items-center justify-between gap-3 border-b border-slate-100 pb-3"><span class="truncate">${ssrInterpolate(row.categoryName)}</span><strong class="money-value shrink-0 text-rose-700">${ssrInterpolate(unref(money)(row.amountMinor))}</strong></div>`);
				});
				_push(`<!--]-->`);
				if (!unref(expenses)?.rows?.length) _push(`<p class="py-8 text-center text-sm text-slate-500">هزینه‌ای ثبت نشده است.</p>`);
				else _push(`<!---->`);
				_push(`</div></div><div class="mobile-card p-4"><h2 class="font-bold">درآمد بر اساس دسته</h2><div class="mt-4 space-y-3"><!--[-->`);
				ssrRenderList(unref(income)?.rows, (row) => {
					_push(`<div class="flex min-h-12 items-center justify-between gap-3 border-b border-slate-100 pb-3"><span class="truncate">${ssrInterpolate(row.categoryName)}</span><strong class="money-value shrink-0 text-emerald-700">${ssrInterpolate(unref(money)(row.amountMinor))}</strong></div>`);
				});
				_push(`<!--]-->`);
				if (!unref(income)?.rows?.length) _push(`<p class="py-8 text-center text-sm text-slate-500">درآمدی ثبت نشده است.</p>`);
				else _push(`<!---->`);
				_push(`</div></div></section>`);
			} else _push(`<!---->`);
			_push(`</div>`);
		};
	}
});
//#endregion
//#region app/pages/reports/index.vue
var _sfc_setup = index_vue_vue_type_script_setup_true_lang_default.setup;
index_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/reports/index.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var reports_default = index_vue_vue_type_script_setup_true_lang_default;

export { reports_default as default };;globalThis.__timing__.logEnd('Load chunks/build/reports-UCO85wjR');
//# sourceMappingURL=reports-UCO85wjR.mjs.map
