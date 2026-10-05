globalThis.__timing__.logStart('Load chunks/build/usePersian-C5t6sT6J');//#region app/composables/usePersian.ts
function usePersian() {
	const dateFormatter = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
		year: "numeric",
		month: "short",
		day: "numeric"
	});
	const numberFormatter = new Intl.NumberFormat("fa-IR", { maximumFractionDigits: 0 });
	const latinNumberFormatter = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
	function moneyFormatter(value, currency = "IRR") {
		const unit = currency === "IRR" ? "ریال" : currency;
		return `${numberFormatter.format(Number(value))} ${unit}`;
	}
	function normalizeDigits(value) {
		return String(value ?? "").replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit))).replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)));
	}
	function digitsOnly(value) {
		return normalizeDigits(value).replace(/\D/g, "");
	}
	function formatAmountInput(value) {
		const digits = digitsOnly(value);
		return digits ? latinNumberFormatter.format(Number(digits)) : "";
	}
	return {
		money: (value, currency = "IRR") => value === null || value === void 0 ? "-" : moneyFormatter(value, currency),
		number: (value) => value === null || value === void 0 ? "-" : numberFormatter.format(Number(value)),
		rawDigits: digitsOnly,
		inputAmount: formatAmountInput,
		date: (value) => value === null || value === void 0 ? "-" : dateFormatter.format(new Date(value))
	};
}

export { usePersian as u };;globalThis.__timing__.logEnd('Load chunks/build/usePersian-C5t6sT6J');
//# sourceMappingURL=usePersian-C5t6sT6J.mjs.map
