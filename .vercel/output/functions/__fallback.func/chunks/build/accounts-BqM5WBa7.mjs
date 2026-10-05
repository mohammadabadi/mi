globalThis.__timing__.logStart('Load chunks/build/accounts-BqM5WBa7');import { u as useFetch } from '../virtual/entry.mjs';
import { _ as _sfc_main } from './Icon-1cxOBUbV.mjs';
import { S as Select_default } from './Select-mj3Sw9q1.mjs';
import { u as usePersian } from './usePersian-C5t6sT6J.mjs';
import { M as MoneyInput_default } from './MoneyInput-D3aHl8SZ.mjs';
import { L as LoadingState_default } from './LoadingState-BO66Wa2p.mjs';
import { defineComponent, computed, reactive, ref, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderAttr, ssrRenderComponent, ssrInterpolate, ssrRenderList } from 'vue/server-renderer';
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

//#region app/pages/accounts/index.vue?vue&type=script&setup=true&lang.ts
var index_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "index",
	__ssrInlineRender: true,
	setup(__props) {
		const { money } = usePersian();
		const { data, pending, refresh } = useFetch("/api/accounts", {
			credentials: "include",
			lazy: true
		}, "$UL0lLN5L_P");
		const accounts = computed(() => data.value?.accounts ?? []);
		const form = reactive({
			name: "",
			type: "bank",
			initialBalanceMinor: "0"
		});
		const error = ref("");
		const success = ref("");
		const accountTypes = [
			{
				value: "bank",
				label: "بانک"
			},
			{
				value: "cash",
				label: "نقدی"
			},
			{
				value: "wallet",
				label: "کیف پول"
			},
			{
				value: "credit_card",
				label: "کارت اعتباری"
			},
			{
				value: "other",
				label: "سایر"
			}
		];
		return (_ctx, _push, _parent, _attrs) => {
			const _component_SharedSelect = Select_default;
			const _component_SharedMoneyInput = MoneyInput_default;
			const _component_UIcon = _sfc_main;
			const _component_SharedLoadingState = LoadingState_default;
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-5" }, _attrs))}><div><p class="text-sm font-semibold text-slate-500">موجودی از تراکنش‌ها محاسبه می‌شود</p><h1 class="text-2xl font-black text-slate-950">حساب‌ها</h1></div><form class="mobile-card p-4"><h2 class="text-lg font-bold">حساب جدید</h2><div class="mt-4 grid gap-3 sm:grid-cols-3"><label class="block sm:col-span-1"><span class="text-sm font-medium">نام حساب</span><input${ssrRenderAttr("value", unref(form).name)} class="field mt-2" placeholder="مثلاً بانک ملت" required></label><label class="block"><span class="text-sm font-medium">نوع</span>`);
			_push(ssrRenderComponent(_component_SharedSelect, {
				modelValue: unref(form).type,
				"onUpdate:modelValue": ($event) => unref(form).type = $event,
				options: accountTypes,
				class: "mt-2"
			}, null, _parent));
			_push(`</label>`);
			_push(ssrRenderComponent(_component_SharedMoneyInput, {
				modelValue: unref(form).initialBalanceMinor,
				"onUpdate:modelValue": ($event) => unref(form).initialBalanceMinor = $event,
				label: "موجودی اولیه",
				required: ""
			}, null, _parent));
			_push(`</div>`);
			if (unref(error)) _push(`<p class="mt-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">${ssrInterpolate(unref(error))}</p>`);
			else _push(`<!---->`);
			if (unref(success)) _push(`<p class="mt-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">${ssrInterpolate(unref(success))}</p>`);
			else _push(`<!---->`);
			_push(`<button class="btn-primary mt-4 w-full sm:w-auto">`);
			_push(ssrRenderComponent(_component_UIcon, {
				name: "i-lucide-plus",
				class: "btn-icon"
			}, null, _parent));
			_push(`<span>افزودن حساب</span></button></form>`);
			if (unref(pending)) _push(ssrRenderComponent(_component_SharedLoadingState, { title: "در حال دریافت حساب‌ها" }, null, _parent));
			else {
				_push(`<section class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"><!--[-->`);
				ssrRenderList(unref(accounts), (account) => {
					_push(`<article class="mobile-card p-4"><div class="flex items-start justify-between gap-4"><div class="min-w-0"><h2 class="truncate font-bold">${ssrInterpolate(account.name)}</h2><p class="mt-1 text-sm text-slate-500">${ssrInterpolate(account.type)}</p></div><button class="icon-danger-button" type="button" aria-label="حذف حساب" title="حذف حساب">`);
					_push(ssrRenderComponent(_component_UIcon, {
						name: "i-lucide-trash-2",
						class: "size-4"
					}, null, _parent));
					_push(`</button></div><div class="money-value mt-5 text-2xl font-black leading-tight text-teal-950">${ssrInterpolate(unref(money)(account.balanceMinor, account.currency))}</div></article>`);
				});
				_push(`<!--]-->`);
				if (!unref(accounts).length) _push(`<p class="mobile-card p-8 text-center text-sm text-slate-500 sm:col-span-2 lg:col-span-3">حسابی ثبت نشده است.</p>`);
				else _push(`<!---->`);
				_push(`</section>`);
			}
			_push(`</div>`);
		};
	}
});
//#endregion
//#region app/pages/accounts/index.vue
var _sfc_setup = index_vue_vue_type_script_setup_true_lang_default.setup;
index_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/accounts/index.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var accounts_default = index_vue_vue_type_script_setup_true_lang_default;

export { accounts_default as default };;globalThis.__timing__.logEnd('Load chunks/build/accounts-BqM5WBa7');
//# sourceMappingURL=accounts-BqM5WBa7.mjs.map
