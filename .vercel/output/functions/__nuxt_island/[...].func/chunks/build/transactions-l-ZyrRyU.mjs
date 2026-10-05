globalThis.__timing__.logStart('Load chunks/build/transactions-l-ZyrRyU');import { u as useFetch } from '../virtual/entry.mjs';
import { _ as _sfc_main } from './Icon-1cxOBUbV.mjs';
import { S as Select_default, o as onClickOutside } from './Select-mj3Sw9q1.mjs';
import { u as usePersian } from './usePersian-C5t6sT6J.mjs';
import { M as MoneyInput_default } from './MoneyInput-D3aHl8SZ.mjs';
import { L as LoadingState_default } from './LoadingState-BO66Wa2p.mjs';
import { defineComponent, reactive, ref, computed, watch, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderClass, ssrRenderComponent, ssrRenderAttr, ssrInterpolate, ssrRenderList, ssrRenderTeleport } from 'vue/server-renderer';
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

//#region app/components/shared/JalaliDatePicker.vue?vue&type=script&setup=true&lang.ts
var JalaliDatePicker_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "JalaliDatePicker",
	__ssrInlineRender: true,
	props: {
		modelValue: {},
		id: {},
		label: { default: "تاریخ" },
		placeholder: { default: "انتخاب تاریخ" },
		required: {
			type: Boolean,
			default: false
		}
	},
	emits: ["update:modelValue"],
	setup(__props, { emit: __emit }) {
		const props = __props;
		const monthNames = [
			"فروردین",
			"اردیبهشت",
			"خرداد",
			"تیر",
			"مرداد",
			"شهریور",
			"مهر",
			"آبان",
			"آذر",
			"دی",
			"بهمن",
			"اسفند"
		];
		const weekDays = [
			"ش",
			"ی",
			"د",
			"س",
			"چ",
			"پ",
			"ج"
		];
		const faNumber = new Intl.NumberFormat("fa-IR", { useGrouping: false });
		const jalaliPartsFormatter = new Intl.DateTimeFormat("en-US-u-ca-persian", {
			year: "numeric",
			month: "numeric",
			day: "numeric"
		});
		const root = ref(null);
		const panel = ref(null);
		const open = ref(false);
		const today = gregorianToJalali(/* @__PURE__ */ new Date());
		const visibleYear = ref(today.jy);
		const visibleMonth = ref(today.jm);
		const selectedJalali = computed(() => props.modelValue ? isoToJalali(props.modelValue) : null);
		const displayValue = computed(() => selectedJalali.value ? formatJalali(selectedJalali.value) : "");
		const visibleMonthTitle = computed(() => `${monthNames[visibleMonth.value - 1]} ${formatNumber(visibleYear.value)}`);
		const monthDays = computed(() => getMonthDays(visibleYear.value, visibleMonth.value));
		const firstDayOffset = computed(() => {
			return (isoToLocalDate(jalaliToIso({
				jy: visibleYear.value,
				jm: visibleMonth.value,
				jd: 1
			})).getDay() + 1) % 7;
		});
		watch(() => props.modelValue, (value) => {
			const selected = value ? isoToJalali(value) : today;
			visibleYear.value = selected.jy;
			visibleMonth.value = selected.jm;
		}, { immediate: true });
		onClickOutside(root, () => {
			open.value = false;
		}, { ignore: [panel] });
		function isSelected(day) {
			const selected = selectedJalali.value;
			return selected?.jy === visibleYear.value && selected.jm === visibleMonth.value && selected.jd === day;
		}
		function isToday(day) {
			return today.jy === visibleYear.value && today.jm === visibleMonth.value && today.jd === day;
		}
		function formatNumber(value) {
			return faNumber.format(value);
		}
		function formatJalali(date) {
			return `${formatNumber(date.jd)} ${monthNames[date.jm - 1]} ${formatNumber(date.jy)}`;
		}
		function getMonthDays(year, month) {
			if (month <= 6) return 31;
			if (month <= 11) return 30;
			return isLeapJalaliYear(year) ? 30 : 29;
		}
		function isoToLocalDate(value) {
			const [year = 0, month = 1, day = 1] = value.split("-").map(Number);
			return new Date(year, month - 1, day);
		}
		function isoToJalali(value) {
			return gregorianToJalali(isoToLocalDate(value));
		}
		function gregorianToJalali(date) {
			const parts = jalaliPartsFormatter.formatToParts(date);
			return {
				jy: Number(parts.find((part) => part.type === "year")?.value ?? 1),
				jm: Number(parts.find((part) => part.type === "month")?.value ?? 1),
				jd: Number(parts.find((part) => part.type === "day")?.value ?? 1)
			};
		}
		function jalaliToIso(date) {
			const start = new Date(date.jy + 621, 2, 15);
			for (let offset = 0; offset <= 370; offset += 1) {
				const candidate = new Date(start);
				candidate.setDate(start.getDate() + offset);
				if (isSameJalaliDate(gregorianToJalali(candidate), date)) return toIsoDate(candidate);
			}
			throw new Error("Invalid Jalali date");
		}
		function isLeapJalaliYear(year) {
			try {
				jalaliToIso({
					jy: year,
					jm: 12,
					jd: 30
				});
				return true;
			} catch {
				return false;
			}
		}
		function isSameJalaliDate(first, second) {
			return first.jy === second.jy && first.jm === second.jm && first.jd === second.jd;
		}
		function toIsoDate(date) {
			return [
				String(date.getFullYear()).padStart(4, "0"),
				String(date.getMonth() + 1).padStart(2, "0"),
				String(date.getDate()).padStart(2, "0")
			].join("-");
		}
		return (_ctx, _push, _parent, _attrs) => {
			const _component_UIcon = _sfc_main;
			_push(`<!--[--><div class="jalali-date-picker"><label class="block"><span class="text-sm font-semibold text-slate-700">${ssrInterpolate(__props.label)}</span><button${ssrRenderAttr("id", __props.id)} type="button" class="${ssrRenderClass([{ "is-open": unref(open) }, "field jalali-date-trigger mt-2"])}"${ssrRenderAttr("aria-expanded", unref(open))}><span class="${ssrRenderClass(unref(displayValue) ? "text-slate-950" : "text-slate-400")}">${ssrInterpolate(unref(displayValue) || __props.placeholder)}</span>`);
			_push(ssrRenderComponent(_component_UIcon, {
				name: "i-lucide-calendar-days",
				class: "size-5 text-teal-700"
			}, null, _parent));
			_push(`</button>`);
			if (__props.required) _push(`<input class="sr-only" tabindex="-1"${ssrRenderAttr("value", __props.modelValue)} required>`);
			else _push(`<!---->`);
			_push(`</label></div>`);
			ssrRenderTeleport(_push, (_push) => {
				if (unref(open)) {
					_push(`<div class="jalali-calendar-layer"><button type="button" class="jalali-calendar-backdrop" aria-label="بستن تقویم"></button><div class="jalali-calendar-panel"><div class="jalali-calendar-header"><button type="button" class="jalali-calendar-nav" aria-label="ماه قبل">`);
					_push(ssrRenderComponent(_component_UIcon, {
						name: "i-lucide-chevron-right",
						class: "size-5"
					}, null, _parent));
					_push(`</button><div class="text-center"><p class="font-black text-slate-950">${ssrInterpolate(unref(visibleMonthTitle))}</p></div><button type="button" class="jalali-calendar-nav" aria-label="ماه بعد">`);
					_push(ssrRenderComponent(_component_UIcon, {
						name: "i-lucide-chevron-left",
						class: "size-5"
					}, null, _parent));
					_push(`</button></div><div class="jalali-weekdays"><!--[-->`);
					ssrRenderList(weekDays, (day) => {
						_push(`<span>${ssrInterpolate(day)}</span>`);
					});
					_push(`<!--]--></div><div class="jalali-days"><!--[-->`);
					ssrRenderList(unref(firstDayOffset), (blank) => {
						_push(`<span></span>`);
					});
					_push(`<!--]--><!--[-->`);
					ssrRenderList(unref(monthDays), (day) => {
						_push(`<button type="button" class="${ssrRenderClass([{
							"is-selected": isSelected(day),
							"is-today": isToday(day)
						}, "jalali-day"])}">${ssrInterpolate(formatNumber(day))}</button>`);
					});
					_push(`<!--]--></div><button type="button" class="jalali-today-button">`);
					_push(ssrRenderComponent(_component_UIcon, {
						name: "i-lucide-sparkles",
						class: "size-4"
					}, null, _parent));
					_push(`<span>امروز</span></button></div></div>`);
				} else _push(`<!---->`);
			}, "body", false, _parent);
			_push(`<!--]-->`);
		};
	}
});
//#endregion
//#region app/components/shared/JalaliDatePicker.vue
var _sfc_setup$1 = JalaliDatePicker_vue_vue_type_script_setup_true_lang_default.setup;
JalaliDatePicker_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/shared/JalaliDatePicker.vue");
	return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
var JalaliDatePicker_default = Object.assign(JalaliDatePicker_vue_vue_type_script_setup_true_lang_default, { __name: "SharedJalaliDatePicker" });
//#endregion
//#region app/pages/transactions/index.vue?vue&type=script&setup=true&lang.ts
var index_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "index",
	__ssrInlineRender: true,
	setup(__props) {
		const { money, date } = usePersian();
		const filters = reactive({
			type: "",
			search: "",
			accountId: "",
			categoryId: "",
			from: "",
			to: "",
			sort: "date_desc",
			page: 1
		});
		const activeForm = ref("transaction");
		const query = computed(() => ({
			page: filters.page,
			limit: 20,
			...filters.type ? { type: filters.type } : {},
			...filters.search ? { search: filters.search } : {},
			...filters.accountId ? { accountId: filters.accountId } : {},
			...filters.categoryId ? { categoryId: filters.categoryId } : {},
			...filters.from ? { from: filters.from } : {},
			...filters.to ? { to: filters.to } : {},
			...filters.sort ? { sort: filters.sort } : {}
		}));
		const { data: transactionsData, pending: transactionsPending, refresh } = useFetch("/api/transactions", {
			query,
			credentials: "include",
			lazy: true
		}, "$r9DPHj6isi");
		const { data: accountsData, pending: accountsPending } = useFetch("/api/accounts", {
			credentials: "include",
			lazy: true
		}, "$u6GnoNvrjt");
		const { data: categoriesData, pending: categoriesPending } = useFetch("/api/categories", {
			credentials: "include",
			lazy: true
		}, "$Fvr-ULlDwi");
		const accounts = computed(() => accountsData.value?.accounts ?? []);
		const categories = computed(() => categoriesData.value?.categories ?? []);
		const transactions = computed(() => transactionsData.value?.transactions ?? []);
		const accountOptions = computed(() => accounts.value.map((account) => ({
			value: account.id,
			label: account.name
		})));
		const accountFilterOptions = computed(() => [{
			value: "",
			label: "همه حساب‌ها"
		}, ...accountOptions.value]);
		const pagePending = computed(() => transactionsPending.value || accountsPending.value || categoriesPending.value);
		const transactionForm = reactive({
			type: "expense",
			accountId: "",
			categoryId: "",
			amountMinor: "",
			date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
			description: ""
		});
		const transferForm = reactive({
			fromAccountId: "",
			toAccountId: "",
			amountMinor: "",
			date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
			description: ""
		});
		const error = ref("");
		const success = ref("");
		const filteredCategories = computed(() => categories.value.filter((category) => category.type === transactionForm.type));
		const categoryOptions = computed(() => filteredCategories.value.map((category) => ({
			value: category.id,
			label: category.name
		})));
		const categoryFilterOptions = computed(() => [{
			value: "",
			label: "همه دسته‌ها"
		}, ...categories.value.filter((category) => !filters.type || category.type === filters.type).map((category) => ({
			value: category.id,
			label: category.name
		}))]);
		const typeOptions = [{
			value: "expense",
			label: "هزینه"
		}, {
			value: "income",
			label: "درآمد"
		}];
		const filterTypeOptions = [{
			value: "",
			label: "همه"
		}, ...typeOptions];
		const sortOptions = [
			{
				value: "date_desc",
				label: "جدیدترین"
			},
			{
				value: "date_asc",
				label: "قدیمی‌ترین"
			},
			{
				value: "amount_desc",
				label: "مبلغ زیاد"
			},
			{
				value: "amount_asc",
				label: "مبلغ کم"
			}
		];
		const activeFilterCount = computed(() => [
			filters.type,
			filters.search,
			filters.accountId,
			filters.categoryId,
			filters.from,
			filters.to,
			filters.sort !== "date_desc" ? filters.sort : ""
		].filter(Boolean).length);
		const hasActiveFilters = computed(() => activeFilterCount.value > 0);
		watch([accountsData, categoriesData], () => {
			transactionForm.accountId ||= accounts.value[0]?.id ?? "";
			transactionForm.categoryId ||= filteredCategories.value[0]?.id ?? "";
			transferForm.fromAccountId ||= accounts.value[0]?.id ?? "";
			transferForm.toAccountId ||= accounts.value[1]?.id ?? "";
		}, { immediate: true });
		watch(() => transactionForm.type, () => {
			transactionForm.categoryId = filteredCategories.value[0]?.id ?? "";
		});
		watch(() => filters.type, () => {
			if (filters.categoryId && !categoryFilterOptions.value.some((option) => option.value === filters.categoryId)) filters.categoryId = "";
		});
		watch(() => [
			filters.type,
			filters.search,
			filters.accountId,
			filters.categoryId,
			filters.from,
			filters.to,
			filters.sort
		], () => {
			filters.page = 1;
		});
		return (_ctx, _push, _parent, _attrs) => {
			const _component_UIcon = _sfc_main;
			const _component_SharedSelect = Select_default;
			const _component_SharedMoneyInput = MoneyInput_default;
			const _component_SharedJalaliDatePicker = JalaliDatePicker_default;
			const _component_SharedLoadingState = LoadingState_default;
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-5" }, _attrs))}><div><p class="text-sm font-semibold text-slate-500">ثبت سریع و مرور روزانه</p><h1 class="text-2xl font-black text-slate-950">تراکنش‌ها</h1></div><section class="mobile-card p-4"><div class="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1"><button class="${ssrRenderClass([unref(activeForm) === "transaction" ? "bg-white text-slate-950 shadow-sm" : "text-slate-500", "min-h-11 rounded-lg text-sm font-bold"])}">`);
			_push(ssrRenderComponent(_component_UIcon, {
				name: "i-lucide-receipt-text",
				class: "inline-block size-4 align-middle"
			}, null, _parent));
			_push(`<span class="align-middle">درآمد / هزینه</span></button><button class="${ssrRenderClass([unref(activeForm) === "transfer" ? "bg-white text-slate-950 shadow-sm" : "text-slate-500", "min-h-11 rounded-lg text-sm font-bold"])}">`);
			_push(ssrRenderComponent(_component_UIcon, {
				name: "i-lucide-arrow-left-right",
				class: "inline-block size-4 align-middle"
			}, null, _parent));
			_push(`<span class="align-middle">انتقال</span></button></div>`);
			if (unref(activeForm) === "transaction") {
				_push(`<form class="mt-4 space-y-4"><div class="grid grid-cols-2 gap-2"><label class="block"><span class="text-sm font-medium">نوع</span>`);
				_push(ssrRenderComponent(_component_SharedSelect, {
					modelValue: unref(transactionForm).type,
					"onUpdate:modelValue": ($event) => unref(transactionForm).type = $event,
					options: typeOptions,
					class: "mt-2"
				}, null, _parent));
				_push(`</label>`);
				_push(ssrRenderComponent(_component_SharedMoneyInput, {
					modelValue: unref(transactionForm).amountMinor,
					"onUpdate:modelValue": ($event) => unref(transactionForm).amountMinor = $event,
					label: "مبلغ",
					required: ""
				}, null, _parent));
				_push(`</div><label class="block"><span class="text-sm font-medium">حساب</span>`);
				_push(ssrRenderComponent(_component_SharedSelect, {
					modelValue: unref(transactionForm).accountId,
					"onUpdate:modelValue": ($event) => unref(transactionForm).accountId = $event,
					options: unref(accountOptions),
					class: "mt-2",
					required: ""
				}, null, _parent));
				_push(`</label><label class="block"><span class="text-sm font-medium">دسته‌بندی</span>`);
				_push(ssrRenderComponent(_component_SharedSelect, {
					modelValue: unref(transactionForm).categoryId,
					"onUpdate:modelValue": ($event) => unref(transactionForm).categoryId = $event,
					options: unref(categoryOptions),
					class: "mt-2",
					required: ""
				}, null, _parent));
				_push(`</label><div class="grid gap-3 sm:grid-cols-2">`);
				_push(ssrRenderComponent(_component_SharedJalaliDatePicker, {
					modelValue: unref(transactionForm).date,
					"onUpdate:modelValue": ($event) => unref(transactionForm).date = $event,
					label: "تاریخ",
					required: ""
				}, null, _parent));
				_push(`<label class="block"><span class="text-sm font-medium">شرح</span><input${ssrRenderAttr("value", unref(transactionForm).description)} class="field mt-2" placeholder="مثلاً سوپرمارکت"></label></div><button class="btn-primary w-full">`);
				_push(ssrRenderComponent(_component_UIcon, {
					name: "i-lucide-plus",
					class: "btn-icon"
				}, null, _parent));
				_push(`<span>ثبت تراکنش</span></button></form>`);
			} else {
				_push(`<form class="mt-4 space-y-4"><div class="grid gap-3 sm:grid-cols-2"><label class="block"><span class="text-sm font-medium">از حساب</span>`);
				_push(ssrRenderComponent(_component_SharedSelect, {
					modelValue: unref(transferForm).fromAccountId,
					"onUpdate:modelValue": ($event) => unref(transferForm).fromAccountId = $event,
					options: unref(accountOptions),
					class: "mt-2",
					required: ""
				}, null, _parent));
				_push(`</label><label class="block"><span class="text-sm font-medium">به حساب</span>`);
				_push(ssrRenderComponent(_component_SharedSelect, {
					modelValue: unref(transferForm).toAccountId,
					"onUpdate:modelValue": ($event) => unref(transferForm).toAccountId = $event,
					options: unref(accountOptions),
					class: "mt-2",
					required: ""
				}, null, _parent));
				_push(`</label></div><div class="grid gap-3 sm:grid-cols-2">`);
				_push(ssrRenderComponent(_component_SharedMoneyInput, {
					modelValue: unref(transferForm).amountMinor,
					"onUpdate:modelValue": ($event) => unref(transferForm).amountMinor = $event,
					label: "مبلغ انتقال",
					required: ""
				}, null, _parent));
				_push(ssrRenderComponent(_component_SharedJalaliDatePicker, {
					modelValue: unref(transferForm).date,
					"onUpdate:modelValue": ($event) => unref(transferForm).date = $event,
					label: "تاریخ انتقال",
					required: ""
				}, null, _parent));
				_push(`</div><label class="block"><span class="text-sm font-medium">شرح</span><input${ssrRenderAttr("value", unref(transferForm).description)} class="field mt-2" placeholder="مثلاً انتقال به کیف پول"></label><button class="btn-primary w-full bg-cyan-700">`);
				_push(ssrRenderComponent(_component_UIcon, {
					name: "i-lucide-arrow-left-right",
					class: "btn-icon"
				}, null, _parent));
				_push(`<span>ثبت انتقال</span></button></form>`);
			}
			if (unref(error)) _push(`<p class="mt-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">${ssrInterpolate(unref(error))}</p>`);
			else _push(`<!---->`);
			if (unref(success)) _push(`<p class="mt-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">${ssrInterpolate(unref(success))}</p>`);
			else _push(`<!---->`);
			_push(`</section><section class="space-y-3"><div class="flex items-center justify-between gap-3"><div><p class="text-xs font-extrabold text-teal-700">گزارش تراکنش‌ها</p><h2 class="text-xl font-black text-slate-950">آخرین تراکنش‌ها</h2></div>`);
			if (unref(hasActiveFilters)) _push(`<span class="rounded-full bg-teal-50 px-3 py-1 text-xs font-black text-teal-800">${ssrInterpolate(unref(activeFilterCount))} فیلتر </span>`);
			else _push(`<!---->`);
			_push(`</div><div class="mobile-card transaction-filters p-3 sm:p-4"><label class="block sm:col-span-2 xl:col-span-3"><span class="text-sm font-semibold text-slate-700">جستجو در شرح تراکنش</span><span class="filter-search mt-2">`);
			_push(ssrRenderComponent(_component_UIcon, {
				name: "i-lucide-search",
				class: "size-5 text-teal-700"
			}, null, _parent));
			_push(`<input${ssrRenderAttr("value", unref(filters).search)} placeholder="مثلا سوپرمارکت، تاکسی، حقوق..." class="field"></span></label><label class="block"><span class="text-sm font-semibold text-slate-700">نوع</span>`);
			_push(ssrRenderComponent(_component_SharedSelect, {
				modelValue: unref(filters).type,
				"onUpdate:modelValue": ($event) => unref(filters).type = $event,
				options: filterTypeOptions,
				class: "mt-2"
			}, null, _parent));
			_push(`</label><label class="block"><span class="text-sm font-semibold text-slate-700">حساب</span>`);
			_push(ssrRenderComponent(_component_SharedSelect, {
				modelValue: unref(filters).accountId,
				"onUpdate:modelValue": ($event) => unref(filters).accountId = $event,
				options: unref(accountFilterOptions),
				class: "mt-2"
			}, null, _parent));
			_push(`</label><label class="block"><span class="text-sm font-semibold text-slate-700">دسته‌بندی</span>`);
			_push(ssrRenderComponent(_component_SharedSelect, {
				modelValue: unref(filters).categoryId,
				"onUpdate:modelValue": ($event) => unref(filters).categoryId = $event,
				options: unref(categoryFilterOptions),
				class: "mt-2"
			}, null, _parent));
			_push(`</label>`);
			_push(ssrRenderComponent(_component_SharedJalaliDatePicker, {
				modelValue: unref(filters).from,
				"onUpdate:modelValue": ($event) => unref(filters).from = $event,
				label: "از تاریخ",
				placeholder: "شروع بازه"
			}, null, _parent));
			_push(ssrRenderComponent(_component_SharedJalaliDatePicker, {
				modelValue: unref(filters).to,
				"onUpdate:modelValue": ($event) => unref(filters).to = $event,
				label: "تا تاریخ",
				placeholder: "پایان بازه"
			}, null, _parent));
			_push(`<label class="block"><span class="text-sm font-semibold text-slate-700">مرتب‌سازی</span>`);
			_push(ssrRenderComponent(_component_SharedSelect, {
				modelValue: unref(filters).sort,
				"onUpdate:modelValue": ($event) => unref(filters).sort = $event,
				options: sortOptions,
				class: "mt-2"
			}, null, _parent));
			_push(`</label>`);
			if (unref(hasActiveFilters)) {
				_push(`<button type="button" class="btn-secondary min-h-12 w-full sm:col-span-2 xl:col-span-1">`);
				_push(ssrRenderComponent(_component_UIcon, {
					name: "i-lucide-rotate-ccw",
					class: "btn-icon"
				}, null, _parent));
				_push(`<span>پاک‌کردن فیلترها</span></button>`);
			} else _push(`<!---->`);
			_push(`</div>`);
			if (unref(pagePending)) _push(ssrRenderComponent(_component_SharedLoadingState, { title: "در حال دریافت تراکنش‌ها" }, null, _parent));
			else {
				_push(`<div class="space-y-3 md:hidden"><!--[-->`);
				ssrRenderList(unref(transactions), (transaction) => {
					_push(`<article class="mobile-card p-4"><div class="flex items-start justify-between gap-3"><div class="min-w-0"><h3 class="truncate font-bold text-slate-950">${ssrInterpolate(transaction.description || transaction.categoryName)}</h3><p class="mt-1 text-sm text-slate-500">${ssrInterpolate(transaction.categoryName)} · ${ssrInterpolate(transaction.accountName)}</p><p class="mt-1 text-xs text-slate-400">${ssrInterpolate(unref(date)(transaction.date))}</p></div><div class="shrink-0 text-left"><div class="${ssrRenderClass([transaction.type === "income" ? "text-emerald-700" : "text-rose-700", "money-value font-black"])}">${ssrInterpolate(transaction.type === "income" ? "+" : "-")}${ssrInterpolate(unref(money)(transaction.amountMinor))}</div><button class="icon-danger-button mt-3 ms-auto" type="button" aria-label="حذف تراکنش" title="حذف تراکنش">`);
					_push(ssrRenderComponent(_component_UIcon, {
						name: "i-lucide-trash-2",
						class: "size-4"
					}, null, _parent));
					_push(`</button></div></div></article>`);
				});
				_push(`<!--]-->`);
				if (!unref(transactions).length) _push(`<p class="mobile-card p-8 text-center text-sm text-slate-500">تراکنشی ثبت نشده است.</p>`);
				else _push(`<!---->`);
				_push(`</div>`);
			}
			if (!unref(pagePending)) {
				_push(`<div class="hidden overflow-hidden rounded-lg border border-slate-200 bg-white md:block"><table class="w-full text-sm"><thead class="bg-slate-50 text-slate-500"><tr><th class="p-3 text-right">تاریخ</th><th class="p-3 text-right">شرح</th><th class="p-3 text-right">دسته</th><th class="p-3 text-right">حساب</th><th class="p-3 text-right">نوع</th><th class="p-3 text-right">مبلغ</th><th class="p-3 text-right">عملیات</th></tr></thead><tbody class="divide-y divide-slate-100"><!--[-->`);
				ssrRenderList(unref(transactions), (transaction) => {
					_push(`<tr><td class="p-3">${ssrInterpolate(unref(date)(transaction.date))}</td><td class="p-3">${ssrInterpolate(transaction.description || "-")}</td><td class="p-3">${ssrInterpolate(transaction.categoryName)}</td><td class="p-3">${ssrInterpolate(transaction.accountName)}</td><td class="p-3">${ssrInterpolate(transaction.type === "income" ? "درآمد" : "هزینه")}</td><td class="${ssrRenderClass([transaction.type === "income" ? "text-emerald-700" : "text-rose-700", "money-value p-3 font-bold"])}">${ssrInterpolate(transaction.type === "income" ? "+" : "-")}${ssrInterpolate(unref(money)(transaction.amountMinor))}</td><td class="p-3"><button class="inline-flex items-center gap-1 rounded-md border border-slate-300 px-3 py-1">`);
					_push(ssrRenderComponent(_component_UIcon, {
						name: "i-lucide-trash-2",
						class: "size-4"
					}, null, _parent));
					_push(`<span>حذف</span></button></td></tr>`);
				});
				_push(`<!--]--></tbody></table>`);
				if (!unref(transactions).length) _push(`<p class="p-8 text-center text-slate-500">تراکنشی ثبت نشده است.</p>`);
				else _push(`<!---->`);
				_push(`</div>`);
			} else _push(`<!---->`);
			_push(`</section></div>`);
		};
	}
});
//#endregion
//#region app/pages/transactions/index.vue
var _sfc_setup = index_vue_vue_type_script_setup_true_lang_default.setup;
index_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/transactions/index.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var transactions_default = index_vue_vue_type_script_setup_true_lang_default;

export { transactions_default as default };;globalThis.__timing__.logEnd('Load chunks/build/transactions-l-ZyrRyU');
//# sourceMappingURL=transactions-l-ZyrRyU.mjs.map
