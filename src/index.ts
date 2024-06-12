import type * as CSS from "csstype"

function element<T extends ((props: object) => JSX.Element)>(component: T, props?: Parameters<T>[0] | null, ...children: JSX.Children): ReturnType<T>

function element<T extends keyof MathMLTags>(tagName: T, props?: JSX.MathMLElementProps<T> | null, ...children: JSX.Children): MathMLElement

function element<T extends keyof SVGTags>(tagName: T, props?: JSX.SVGElementProps<T> | null, ...children: JSX.Children): SVGElementTagNameMap[T]

function element<T extends keyof HTMLTags>(tagName: T, props?: JSX.HTMLElementProps<T> | null, ...children: JSX.Children): HTMLElementTagNameMap[T]

function element(tagName: ((props: object) => JSX.Element) | string, props?: { [key: string]: any } | null, ...children: JSX.Children) {
	if (typeof tagName == "string") {
		const el = tagMap[tagName]?.(tagName) || document.createElement(tagName)

		appendChildren(
			props?.children != null ? [props.children] : children,
			props?.shadowRootOptions ? el.attachShadow(props.shadowRootOptions) : el
		)
		if (props) {
			const { attributes, style, dataset, ref } = props

			for (let prop in props) {
				if (!specialProps.has(prop)) el[prop] = props[prop]
			}

			if (attributes) for (let attr in attributes) el.setAttribute(attr, attributes[attr])
			if (dataset) Object.assign(el.dataset, dataset)
			if (style) // @ts-ignore
				typeof style == "string" ? el.style = style : addStyles(el.style, style)

			if (ref) typeof ref == "function" ? ref(el) : ref.value = el
		}
		return el
	}

	let l = children.length
	// If there are children they need to be passed to the component
	// If there"s only 1 child, children should not be an array
	return tagName(l ? { children: l > 1 ? children : children[0], ...props } : props || {})
}

const fragment = ({ children }: { children?: JSX.Child | JSX.Children }) => {
	const fragment = new DocumentFragment
	if (children) appendChildren([children], fragment)
	return fragment
}

const ref = <T>(value?: T | null) => ({ value })

const addStyles = (style: CSSStyleDeclaration, styles: JSX.CSSProperties) => {
	for (let name in styles) {
		if (name.indexOf("--")) style[name] = styles[name]
		else style.setProperty(name, styles[name])
	}
}

const appendChildren = (children: JSX.Children, parent: ParentNode) => {
	for (let child of children) {
		if (child == null || typeof child == "boolean") continue
		if (Array.isArray(child)) appendChildren(child, parent)
		// Letting javascript convert numbers automatically
		else parent.append(child as string | Node)
	}
}

// SVG elements with the same name as an HTML element such as `a`, `script`, `style` and `title` are removed
/** Adds SVG support. Must be called before creating any SVG elements with JSX. */
const addSVGSupport = () => {
	let fn = (tagName: string) => document.createElementNS("http://www.w3.org/2000/svg", tagName);
	[
		"animate", "animateMotion", "animateTransform", "circle", "clipPath", "defs", "desc",
		"ellipse", "feBlend", "feColorMatrix", "feComponentTransfer", "feDiffuseLighting",
		"feDisplacementMap", "feDistanceLight", "feDropShadow", "feFlood", "feFuncA", "feFuncB",
		"feFuncG", "feFuncR", "feGaussianBlur", "feImage", "feMerge", "feMergeNode", "feMorphology",
		"feOffset", "fePointLight", "feSpecularLighting", "feSpotLight", "feTile", "feTurbulence",
		"filter", "foreignObject", "g", "image", "line", "linearGradient", "marker", "mask",
		"metadata", "mpath", "path", "pattern", "polygon", "polyline", "radialGradient", "rect",
		"set", "stop", "svg", "switch", "symbol", "text", "textPath", "tspan", "use", "view"
	].forEach(tag => tagMap[tag] = fn)
}

/** Adds MathML support. Must be called before creating any MathML elements with JSX. */
const addMathMLSupport = () => {
	let fn = (tagName: string) => document.createElementNS("http://www.w3.org/1998/Math/MathML", tagName);
	[
		"annotation", "annotation-xml", "maction", "math", "merror", "mfrac", "mi",
    "mmultiscripts", "mn", "mo", "mover", "mpadded", "mphantom", "mprescripts",
    "mroot", "mrow", "ms", "mspace", "msqrt", "mstyle", "msub", "msubsup", "msup",
    "mtable", "mtd", "mtext", "mtr", "munder", "munderover", "semantics"
	].forEach(tag => tagMap[tag] = fn)
}

const tagMap: Record<string, (tagName: string) => SVGElement | MathMLElement> = {}

const specialProps = new Set(["dataset", "style", "attributes", "ref", "children"])

type CustomProperties = {
	[key: `--${string}`]: string | null
}

type HTMLTags = {
	[Property in keyof HTMLElementTagNameMap]: object
}

type SVGTags = {
	[Property in keyof FilteredSVGTagNameMap]: object
}

type MathMLTags = {
	[Property in keyof MathMLElementTagNameMap]: object
}

type FilteredSVGTagNameMap = Omit<SVGElementTagNameMap, "a" | "script" | "style" | "title">

type AriaRole = "alert" | "alertdialog" | "application" | "article" | "banner" | "button" | "cell" | "checkbox" |
	"columnheader" | "combobox" | "complementary" | "contentinfo" | "definition" | "dialog" | "directory" | "document" |
	"feed" | "figure" | "form" | "grid" | "gridcell" | "group" | "heading" | "img" | "link" | "list" | "listbox" |
	"listitem" | "log" | "main" | "marquee" | "math" | "menu" | "menubar" | "menuitem" | "menuitemcheckbox" |
	"menuitemradio" | "navigation" | "none" | "note" | "option" | "presentation" | "progressbar" | "radio" |
	"radiogroup" | "region" | "row" | "rowgroup" | "rowheader" | "scrollbar" | "search" | "searchbox" |
	"separator" | "slider" | "spinbutton" | "status" | "switch" | "tab" | "table" | "tablist" | "tabpanel" |
	"term" | "textbox" | "timer" | "toolbar" | "tooltip" | "tree" | "treegrid" | "treeitem"

type Autocomplete = "off" | "on" | "name" | "honorific-prefix" | "given-name" | "additional-name" |
	"family-game" | "honorific-suffix" | "nickname" | "email" | "username" | "new-password" |
	"current-password" | "one-time-code" | "organization-title" | "organization" | "addess-line1" |
	"address-line2" | "address-line3" | "address-level4" | "address-level3" | "address-level2" |
	"address-level1" | "country" | "country-name" | "postal-code" | "cc-name" | "cc-given-name" |
	"cc-additional-name" | "cc-family-name" | "cc-number" | "cc-exp" | "cc-exp-month" | "cc-exp-year" |
	"cc-csc" | "cc-type" | "transaction-amount" | "language" | "bday" | "bday-day" | "bday-month" |
	"bday-year" | "sex" | "tel" | "tel-country-code" | "tel-national" | "tel-area-code" | "tel-local" |
	"tel-extension" | "impp" | "url" | "photo" | (string & {})

type ReferrerPolicy = "no-referrer" | "no-referrer-when-downgrade" | "origin" | "origin-when-cross-origin" | "same-origin" | "strict-origin" | "strict-origin-when-cross-origin" | "unsafe-url"
type Target = "_self" | "_blank" | "_parent" | "_top"
type Align = "left" | "right" | "justify" | "center"
type VAlign = "top" | "middle" | "bottom" | "baseline"
type Booleanish = "true" | "false" | boolean

interface PictureInPictureEvent extends Event {
	pictureInPictureWindow: PictureInPictureWindow
}

interface ContentVisibilityAutoStateChangeEvent extends Event {
	readonly skipped: boolean
}

interface ToggleEvent extends Event {
	readonly newState: "open" | "closed"
	readonly oldState: "open" | "closed"
}

interface OverscrollEvent extends Event {
	readonly deltaX: number
	readonly deltaY: number
}

type AnimationAttributes = {
	accumulate: "none" | "sum"
	additive: "replace" | "sum"
	attributeName: string
	/** @deprecated */
	attributeType: "CSS" | "XML" | "auto"
	begin: string
	by: string
	calcMode: "discrete" | "linear" | "paced" | "spline"
	dur: string
	fill: "freeze" | "remove"
	from: string
	href: string
	min: string
	max: string
	keySplines: string
	keyTimes: string
	restart: "always" | "whenNotActive" | "never"
	repeatCount: number | "indefinite"
	repeatDur: string
	to: string
	values: string
}

type CommonPresentationAttributes = {
	"clip-path": string
	"clip-rule": "nonzero" | "evenodd" | "inherit"
	color: string
	"color-interpolation": "auto" | "sRGB" | "linearRGB" | "inherit"
	"color-rendering": "auto" | "optimizeSpeed" | "optimizeQuality" | "inherit"
	cursor: string
	display: string
	fill: string
	"fill-opacity": string | number
	"fill-rule": "nonzero" | "evenodd" | "inherit"
	filter: string
	mask: string
	opacity: string | number
	"pointer-events": "bounding-box" | "visiblePainted" | "visibleFill" | "visibleStroke" | "visible" | "painted" | "fill" | "stroke" | "all" | "none"
	"shape-rendering": "auto" | "optimizeSpeed" | "crispEdges" | "geometricPrecision" | "inherit"
	stroke: string
	"stroke-dasharray": string
	"stroke-dashoffset": string | number
	"stroke-linecap": "butt" | "round" | "square"
	"stroke-linejoin": "arcs" | "bevel" | "miter" | "miter-clip" | "round"
	"stroke-miterlimit": string | number
	"stroke-opacity": string | number
	"stroke-width": string | number
	transform: string
	"vector-effect": "none" | "non-scaling-stroke" | "non-scaling-size" | "none-rotation" | "fixed-position"
	visibility: "visible" | "hidden" | "collapse" | "inherit"
}

type TextAttributes = {
	direction: "ltr" | "rtl" | "inherit"
	"dominant-baseline": "auto" | "text-bottom" | "alphabetic" | "ideographic" | "middle" | "central" | "mathematical" | "hanging" | "text-top"
	"font-family": string
	"font-size": string
	"font-size-adjust": string | number
	"font-stretch": string
	"font-style": "normal" | "italic" | "oblique"
	"font-variant": string
	"font-weight": string
	/** @deprecated */
	"glyph-orientation-horizontal": string
	/** @deprecated */
	"glyph-orientation-vertical": string
	/** @deprecated */
	kerning: string
	lengthAdjust: "spacing" | "spacingAndGlyphs"
	"letter-spacing": string
	systemLanguage: string
	"text-anchor": "start" | "middle" | "end" | "inherit"
	"text-decortation": "none" | "underline" | "overline" | "line-through" | "blink" | "inherit"
	textLength: string
	"unicode-bidi": string
	"word-spacing": string
	"writing-mode": "lr-tb" | "rl-tb" | "tb-rl" | "lr" | "rl" | "tb" | "inherit"
}

type FilterAttributes = {
	height: string | number
	result: string
	width: string | number
	x: string | number
	y: string | number
}

type TransferFuncAttributes = {
	amplitude: string | number
	exponent: string | number
	intercept: string | number
	offset: string | number
	slope: string | number
	type: "identity" | "table" | "discrete" | "linear" | "gamma"
	tableValues: string
	x: string | number
	y: string | number
}

declare global {
	namespace JSX {
		// The typing that can be done with JSX.Element is unfortunitely very limited
		// JSX.Element can also be a DocumentFragment which can cause problems
		type Element = HTMLElement | SVGElement
		interface ElementChildrenAttribute { children: {} }
		type IntrinsicElements = {
			[T in keyof HTMLElementTagNameMap]: HTMLElementProps<T>
		} & {
			[T in keyof FilteredSVGTagNameMap]: SVGElementProps<T>
		} & {
			[T in keyof MathMLElementTagNameMap]: MathMLElementProps<T>
		}

		type Child = Node | string | number | null | undefined | boolean
		type Children = (Child | Children)[]
		type CSSProperties = CSS.Properties | CustomProperties

		type SVGElementProps<T extends keyof SVGTags> = WritableSVGProps<T> & {
			attributes?: Partial<AriaAttributes & GlobalSVGAttributes & SVGAttributes[T]>,
			style?: JSX.CSSProperties | string,
			dataset?: { [key: string]: string | number | boolean }
			ref?: ReturnType<typeof ref<SVGElementTagNameMap[T]>> | ((el: SVGElementTagNameMap[T]) => any)
			children?: JSX.Child | JSX.Children
		}

		type HTMLElementProps<T extends keyof HTMLTags> = WritableHTMLProps<T> & {
			attributes?: Partial<AriaAttributes & GlobalHTMLAttributes & HTMLAttributes[T]>,
			style?: JSX.CSSProperties | string,
			dataset?: { [key: string]: string | number | boolean }
			ref?: ReturnType<typeof ref<HTMLElementTagNameMap[T]>> | ((el: HTMLElementTagNameMap[T]) => any)
			children?: JSX.Child | JSX.Children
		}

		type MathMLElementProps<T extends keyof MathMLTags> = WritableMathMLProps & {
			attributes?: Partial<AriaAttributes & GlobalHTMLAttributes & MathMLAttributes[T]>,
			style?: JSX.CSSProperties | string,
			dataset?: { [key: string]: string | number | boolean }
			ref?: ReturnType<typeof ref<MathMLElement>> | ((el: MathMLElement) => any)
			children?: JSX.Child | JSX.Children
		}

		type WritableSVGProps<Tag extends keyof SVGTags> = Partial<CommonWritableSVGProps & WritableSVGElementProps[Tag] & EventHandlers<SVGElementTagNameMap[Tag]>>
		type WritableHTMLProps<Tag extends keyof HTMLTags> = Partial<CommonWritableHTMLProps & WritableElementProps[Tag] & EventHandlers<HTMLElementTagNameMap[Tag]>>
		type WritableMathMLProps = Partial<CommonWritableMathMLProps & EventHandlers<MathMLElement>>

		interface AriaAttributes {
			"aria-atomic": string
			"aria-auto-complete": "none" | "inline" | "list" | "both"
			"aria-busy": Booleanish
			"aria-checked": Booleanish
			"aria-col-count": number
			"aria-col-index": number
			"aria-col-span": number
			"aria-current": "page" | "step" | "location" | "date" | "time" | Booleanish
			"aria-description": string
			"aria-disabled": Booleanish
			"aria-expanded": Booleanish
			"aria-has-popup": Booleanish
			"aria-hidden": Booleanish
			"aria-invalid": Booleanish
			"aria-keu-shortcuts": string
			"aria-label": string
			"aria-level": number
			"aria-live": "assertive" | "off" | "polite"
			"aria-modal": Booleanish
			"aria-multi-line": Booleanish
			"aria-multi-selectable": Booleanish
			"aria-orientation": "horizontal" | "vertical" | "undefined"
			"aria-placeholder": string
			"aria-pos-in-set": number
			"aria-pressed": Booleanish | "mixed"
			"aria-read-only": Booleanish
			"aria-relevant":  "additions" | "all" | "removals" | "text" | "additions text"
			"aria-required": Booleanish
			"aria-role-description": string
			"aria-row-count": number
			"aria-row-index": number
			"aria-row-span": number
			"aria-selected": Booleanish
			"aria-set-size": number
			"aria-sort": "ascending" | "descending" | "none" | "other"
			"aria-value-max": number
			"aria-value-min": number
			"aria-value-now": number
			"aria-value-text": string
		}

		// Most of these can be set as props as well, but might as well give developers the choice between both
		type GlobalHTMLAttributes = {
			[key: `data-${string}`]: string | number | boolean
			accesskey: string
			autocapitalize: "off" | "none" | "on" | "sentences" | "words" | "characters"
			autofocus: Booleanish | ""
			class: string
			contenteditable: Booleanish | "plaintext-only" | ""
			dir: "lrt" | "rtl" | "auto"
			draggable: Booleanish | ""
			enterkeyhint: "enter" | "done" | "go" | "next" | "previous" | "search" | "send"
			hidden: Booleanish | ""
			id: string
			inert: Booleanish | ""
			inputmode: "none" | "text" | "decimal" | "numeric" | "tel" | "search" | "email" | "url"
			is: string
			itemid: string
			itemprop: string
			itemref: string
			itemscope: Booleanish | ""
			itemtype: string
			lang: string
			nonce: string
			part: string
			popover: "auto" | "manual"
			role: AriaRole
			slot: string
			spellcheck: Booleanish | ""
			style: string
			tabindex: string | number
			title: string
			translate: "yes" | "no" | ""
		}

		type GlobalSVGAttributes = {
			[key: `data-${string}`]: string | number | boolean
			class: string
			id: string
			lang: string
			style: string
			tabindex: string | number
		}

		type GlobalMathMLAttributes = {
			[key: `data-${string}`]: string | number | boolean
			class: string
			dir: "lrt" | "rtl"
			displaystyle: Booleanish
			id: string
			mathbackground: string
			mathcolor: string
			mathsize: string
			mathvariant: "normal" | "bold" | "italic" | "bold-italic" | "double-struct" | "bold-fraktur" | "script" | "bold-script" | "fraktur" | "sans-serif" | "bold-sans-serif" | "sens-serif-italic" | "sans-serif-bold-italic" | "monospace" | "initial" | "tailed" | "looped" | "stretched"
			nonce: string
			scriptlevel: `+${number}` | `${number}` | number
			style: string
			tabindex: string | number
		}

		type CommonWritableHTMLProps = {
			accessKey: string
			className: string
			contentEditable: Booleanish | "plaintext-only" | "inherit" | ""
			dir: "lrt" | "rtl" | "auto"
			draggable: boolean
			enterKeyHint: "enter" | "done" | "go" | "next" | "previous" | "search" | "send"
			hidden: boolean
			id: string
			inert: boolean
			innerHTML: string
			innerText: string
			inputMode: "none" | "text" | "decimal" | "numeric" | "tel" | "search" | "email" | "url"
			lang: string
			nonce: string
			outerText: string
			outerHTML: string
			popover: "auto" | "manual" | null
			scrollLeft: number
			scrollTop: number
			slot: string
			spellcheck: boolean
			tabIndex: number
			textContent: string
			title: string
			translate: boolean
			virtualKeyboardPolicy: "auto" | "manual"
			writingSuggestions: Booleanish
		}
		
		type CommonWritableSVGProps = {
			autofocus: boolean
			id: string
			innerHTML: string
			outerHTML: string
			nonce: string
			scrollLeft: number
			scrollTop: number
			slot: string
			tabIndex: number
			textContent: string
		}

		type CommonWritableMathMLProps = {
			autofocus: boolean
			className: string
			id: string
			innerHTML: string
			nonce: string
			outerHTML: string
			scrollLeft: number
			scrollTop: number
			slot: string
			tabIndex: number
			textContent: string
		}

		// Most events that can only be fired on a few different types of elements are removed
		type EventHandlers<T> = {
			oncontentvisibilityautostatechange: (this: T, ev: ContentVisibilityAutoStateChangeEvent) => any
			onerror: (this: T, ev: ErrorEvent) => any
			onload: (this: T, ev: Event) => any
			onscroll: (this: T, ev: Event) => any
			onscrollend: (this: T, ev: Event) => any
			onoverscroll: (this: T, ev: OverscrollEvent) => any
			onsecuritypolicyviolation: (this: T, ev: SecurityPolicyViolationEvent) => any
			onselect: (this: T, ev: Event) => any
			onwheel: (this: T, ev: Event) => any
			oncopy: (this: T, ev: ClipboardEvent) => any
			oncut: (this: T, ev: ClipboardEvent) => any
			onpaste: (this: T, ev: ClipboardEvent) => any
			onblur: (this: T, ev: FocusEvent) => any
			onfocus: (this: T, ev: FocusEvent) => any
			onfocusin: (this: T, ev: FocusEvent) => any
			onfocusout: (this: T, ev: FocusEvent) => any
			onfullscreenchange: (this: T, ev: Event) => any
			onfullscreenerror: (this: T, ev: Event) => any
			onkeydown: (this: T, ev: KeyboardEvent) => any
			onkeypress: (this: T, ev: KeyboardEvent) => any
			onkeyup: (this: T, ev: KeyboardEvent) => any
			onauxclick: (this: T, ev: MouseEvent) => any
			onclick: (this: T, ev: MouseEvent) => any
			oncontextmenu: (this: T, ev: MouseEvent) => any
			ondblclick: (this: T, ev: MouseEvent) => any
			onmousedown: (this: T, ev: MouseEvent) => any
			onmouseenter: (this: T, ev: MouseEvent) => any
			onmouseleave: (this: T, ev: MouseEvent) => any
			onmousemove: (this: T, ev: MouseEvent) => any
			onmouseout: (this: T, ev: MouseEvent) => any
			onmouseover: (this: T, ev: MouseEvent) => any
			onmouseup: (this: T, ev: MouseEvent) => any
			ontouchcancel: (this: T, ev: TouchEvent) => any
			ontouchend: (this: T, ev: TouchEvent) => any
			ontouchmove: (this: T, ev: TouchEvent) => any
			ontouchstart: (this: T, ev: TouchEvent) => any
			onpointerdown: (this: T, ev: PointerEvent) => any
			onpointermove: (this: T, ev: PointerEvent) => any
			onpointerup: (this: T, ev: PointerEvent) => any
			onpointercancel: (this: T, ev: PointerEvent) => any
			onpointerover: (this: T, ev: PointerEvent) => any
			onpointerout: (this: T, ev: PointerEvent) => any
			onpointerenter: (this: T, ev: PointerEvent) => any
			onpointerleave: (this: T, ev: PointerEvent) => any
			ongotpointercapture: (this: T, ev: PointerEvent) => any
			onlostpointercapture: (this: T, ev: PointerEvent) => any
			ondrag: (this: T, ev: DragEvent) => any
			ondragend: (this: T, ev: DragEvent) => any
			ondragenter: (this: T, ev: DragEvent) => any
			ondragleave: (this: T, ev: DragEvent) => any
			ondragover: (this: T, ev: DragEvent) => any
			ondragstart: (this: T, ev: DragEvent) => any
			onselectstart: (this: T, ev: Event) => any
			onselectionchange: (this: T, ev: Event) => any
			oninvalid: (this: T, ev: Event) => any
			/** Warning: Only supported with `addEventListener` in chromium browsers */
			onanimationcancel: (this: T, ev: AnimationEvent) => any
			onanimationend: (this: T, ev: AnimationEvent) => any
			onanimationiteration: (this: T, ev: AnimationEvent) => any
			onanimationstart: (this: T, ev: AnimationEvent) => any
			ontransitionrun: (this: T, ev: TransitionEvent) => any
			ontransitionstart: (this: T, ev: TransitionEvent) => any
			ontransitionend: (this: T, ev: TransitionEvent) => any
			ontransitioncancel: (this: T, ev: TransitionEvent) => any
			oninput: (this: T, ev: Event) => any
			onbeforeinput: (this: T, ev: Event) => any
			onbeforetoggle: (this: T, ev: ToggleEvent) => any
			ontoggle: (this: T, ev: ToggleEvent) => any
			onbeforematch: (this: T, ev: Event) => any
		}

		// Writable properties specific to a certain element
		// Some are likely missing
		interface WritableElementProps extends HTMLTags {
			a: {
				download: string
				hash: string
				host: string
				hostname: string
				href: string
				hreflang: string
				password: string
				pathname: string
				port: string | number
				protocol: string
				referrerPolicy: ReferrerPolicy
				rel: "alternate" | "author" | "bookmark" | "external" | "help" | "license" | "me" | "next" | "nofollow" | "noopener" | "noreferrer" | "opener" | "prev" | "search" | "tag"
				search: string
				target: Target
				text: string
				type: string
				username: string
				/** @deprecated */
				charset: string
				/** @deprecated */
				coords: string
				/** @deprecated */
				name: string
				/** @deprecated */
				rev: string
				/** @deprecated */
				shape: string
			}
			abbr: {}
			address: {}
			area: {
				alt: string
				coords: string
				download: string
				hash: string
				host: string
				hostname: string
				href: string
				/** @deprecated */
				noHref: boolean
				password: string
				pathname: string
				port: string
				protocol: string
				referrerPolicy: ReferrerPolicy
				rel: "alternate" | "author" | "bookmark" | "external" | "help" | "license" | "me" | "next" | "nofollow" | "noopener" | "noreferrer" | "opener" | "prev" | "search" | "tag"
				search: string
				shape: "rect" | "circle" | "poly" | "default"
				target: Target
				username: string
			}
			article: {
				shadowRootOptions: ShadowRootInit
			}
			aside: {
				shadowRootOptions: ShadowRootInit
			}
			audio: {
				autoplay: boolean
				controls: boolean
				crossOrigin: "anonymous" | "use-credentials" | ""
				currentTime: number
				defaultMuted: boolean
				defaultPlaybackRate: number
				disableRemotePlayback: boolean
				loop: boolean
				muted: boolean
				playbackRate: number
				preload: "none" | "metadata" | "auto"
				preservesPitch: boolean
				src: string
				srcObject: MediaStream | MediaSource | Blob
				volume: number
				onabort: (this: HTMLAudioElement, ev: UIEvent) => any
				oncanplay: (this: HTMLAudioElement, ev: Event) => any
				oncanplaythrough: (this: HTMLAudioElement, ev: Event) => any
				ondurationchange: (this: HTMLAudioElement, ev: Event) => any
				onemptied: (this: HTMLAudioElement, ev: Event) => any
				onended: (this: HTMLAudioElement, ev: Event) => any
				onloadeddata: (this: HTMLAudioElement, ev: Event) => any
				onloadedmetadata: (this: HTMLAudioElement, ev: Event) => any
				onloadstart: (this: HTMLAudioElement, ev: Event) => any
				onpause: (this: HTMLAudioElement, ev: Event) => any
				onplay: (this: HTMLAudioElement, ev: Event) => any
				onplaying: (this: HTMLAudioElement, ev: Event) => any
				onprogress: (this: HTMLAudioElement, ev: ProgressEvent<HTMLAudioElement>) => any
				onratechange: (this: HTMLAudioElement, ev: Event) => any
				onseeked: (this: HTMLAudioElement, ev: Event) => any
				onseeking: (this: HTMLAudioElement, ev: Event) => any
				onsuspend: (this: HTMLAudioElement, ev: Event) => any
				ontimeupdate: (this: HTMLAudioElement, ev: Event) => any
				onvolumechange: (this: HTMLAudioElement, ev: Event) => any
				onwaiting: (this: HTMLAudioElement, ev: Event) => any
				onencrypted: (this: HTMLAudioElement, ev: Event) => any
				onwaitingforkey: (this: HTMLAudioElement, ev: Event) => any
			}
			b: {}
			base: {
				href: string
				target: Target
			}
			bdi: {}
			bdo: {}
			blockquote: {
				cite: string
				shadowRootOptions: ShadowRootInit
			}
			body: {
				/** @deprecated */
				aLink: string
				/** @deprecated */
				background: string
				/** @deprecated */
				bgColor: string
				/** @deprecated */
				link: string
				shadowRootOptions: ShadowRootInit
				/** @deprecated */
				text: string
				/** @deprecated */
				vLink: string
			}
			br: {
				/** @deprecated */
				clear: string	
			}
			button: {
				autoFocus: boolean
				disabled: boolean
				formAction: string
				formEnctype: "application/x-www-form-urlencoded" | "multipart/form-data" | "text/plain"
				formMethod: "post" | "get" | "dialog"
				formNoValidate: boolean
				formTarget: Target
				name: string
				popoverTargetAction: "hide" | "show" | "toggle"
				popoverTargetElement: JSX.Element
				type: "submit" | "reset" | "button" | "menu"
				value: string
			}
			canvas: {
				height: string | number
				width: string | number

				oncontextlost: (this: HTMLCanvasElement, ev: Event) => any
				oncontextrestored: (this: HTMLCanvasElement, ev: Event) => any
			}
			caption: {
				/** @deprecated */
				align: Align
			}
			cite: {}
			code: {}
			col: {
				/** @deprecated */
				align: Align
				/** @deprecated */
				ch: string
				/** @deprecated */
				chOff: string
				span: number
				/** @deprecated */
				vAlign: VAlign
				/** @deprecated */
				width: string
			}
			colgroup: {
				/** @deprecated */
				align: Align
				/** @deprecated */
				ch: string
				/** @deprecated */
				chOff: string
				span: number
				/** @deprecated */
				vAlign: VAlign
				/** @deprecated */
				width: string
			}
			data: {
				value: string
			}
			datalist: {}
			dd: {}
			del: {
				cite: string
				dateTime: string
			}
			details: {
				open: boolean
				ontoggle: (this: HTMLDetailsElement, ev: Event) => any
			}
			dialog: {
				open: boolean
				returnValue: string
				oncancel: (this: HTMLDialogElement, ev: Event) => any
				onclose: (this: HTMLDialogElement, ev: Event) => any
			}
			div: {
				/** @deprecated */
				align: Align
				shadowRootOptions: ShadowRootInit
			}
			dl: {
				/** @deprecated */
				compact: boolean
			}
			dt: {}
			em: {}
			embed: {
				/** @deprecated */
				align: Align
				height: string | number
				/** @deprecated */
				name: string
				src: string
				type: string
				width: string | number
			}
			fieldset: {
				disabled: boolean
				name: string
			}
			figcaption: {}
			figure: {}
			footer: {
				shadowRootOptions: ShadowRootInit
			}
			form: {
				name: string
				method: "post" | "get" | "dialog"
				action: string
				enctype: "application/x-www-form-urlencoded" | "multipart/form-data" | "text/plain"
				encoding: string
				acceptCharset: string
				autocomplete: "on" | "off" | ""
				noValidate: boolean
				rel: "external" | "help" | "license" | "next" | "nofollow" | "noopener" | "noreferrer" | "opener" | "prev" | "search"
				target: Target
				onreset: (this: HTMLFormElement, ev: Event) => any
				onsubmit: (this: HTMLFormElement, ev: SubmitEvent) => any
			}
			h1: {
				/** @deprecated */
				align: Align
				shadowRootOptions: ShadowRootInit
			}
			h2: {
				/** @deprecated */
				align: Align
				shadowRootOptions: ShadowRootInit
			}
			h3: {
				/** @deprecated */
				align: Align
				shadowRootOptions: ShadowRootInit
			}
			h4: {
				/** @deprecated */
				align: Align
				shadowRootOptions: ShadowRootInit
			}
			h5: {
				/** @deprecated */
				align: Align
				shadowRootOptions: ShadowRootInit
			}
			h6: {
				/** @deprecated */
				align: Align
				shadowRootOptions: ShadowRootInit
			}
			head: {
				/** @deprecated */
				profile: string
			}
			header: {
				shadowRootOptions: ShadowRootInit
			}
			hgroup: {}
			hr: {
				/** @deprecated */
				align: Align
				/** @deprecated */
				color: string
				/** @deprecated */
				noshade: string
				/** @deprecated */
				size: string
				/** @deprecated */
				width: string
			}
			html: {
				/** @deprecated */
				version: string
			}
			i: {}
			iframe: {
				/** @deprecated */
				align: Align
				allow: string
				allowFullscreen: boolean
				/** @deprecated */
				allowPaymentRequest: boolean
				browsingTopics: boolean
				credentialless: boolean
				csp: string
				/** @deprecated */
				frameBorder: string
				height: string | number
				/** @deprecated */
				longDesc: string
				/** @deprecated */
				marginHeight: string
				/** @deprecated */
				marginWidth: string
				name: string
				referrerPolicy: ReferrerPolicy
				sandbox: "" | "allow-downloads" | "allow-downloads-without-user-activation" | "allow-forms" | "allow-modals" | "allow-orientation-lock" | "allow-pointer-lock" | "allow-popups" | "allow-popups-to-escape-sandbox" | "allow-presentation" | "allow-same-origin" | "allow-scripts" | "allow-storage-access-by-user-activation" | "allow-top-navigation" | "allow-top-navigation-by-user-activation" | "allow-top-navigation-to-custom-protocols" | (string & {})
				/** @deprecated */
				scrolling: "auto" | "yes" | "no"
				src: string
				srcdoc: string
				width: string | number
			}
			img: {
				alt: string
				crossOrigin: "anonymous" | "use-credentials" | ""
				decoding: "sync" | "async" | "auto"
				fetchPriority: "auto" | "high" | "low"
				height: string | number
				isMap: boolean
				loading: "eager" | "lazy"
				referrerPolicy: ReferrerPolicy
				sizes: string
				src: string
				srcset: string
				useMap: string
				width: string | number
				/** @deprecated */
				align: Align
				/** @deprecated */
				border: string
				/** @deprecated */
				hspace: number
				/** @deprecated */
				longDesc: string
				/** @deprecated */
				name: string
			}
			input: {
				/** @deprecated */
				align: Align
				autocapitalize: "none" | "off" | "characters" | "words" | "sentences"
				defaultValue: string
				dirName: string
				multiple: boolean
				name: string
				step: string
				type: "button" | "checkbox" | "color" | "date" | "datetime-local" | "email" | "file" | "hidden" | "image" | "month" | "number" | "password" | "radio" | "range" | "reset" | "search" | "submit" | "tel" | "text" | "time" | "url" | "week"
				/** @deprecated */
				useMap: string
				value: string | number
				valueAsDate: Date
				valueAsNumber: number
				formAction: string
				formEnctype: "application/x-www-form-urlencoded" | "multipart/form-data" | "text/plain"
				formMethod: "get" | "post" | "dialog"
				formNoValidate: boolean
				formTaget: Target
				popoverTargetAction: "hide" | "show" | "toggle"
				popoverTargetElement: JSX.Element
				autofocus: boolean
				disabled: boolean
				required: boolean
				validationMessage: string
				checked: boolean
				defaultChecked: boolean
				indeterminate: boolean
				alt: string
				height: string | number
				src: string
				width: string | number
				accept: string
				files: FileList
				capture: "user" | "environment"
				autocomplete: Autocomplete
				max: string | number
				maxLength: number
				min: string | number
				minLength: number
				pattern: string
				placeholder: string
				readOnly: boolean
				selectionEnd: number
				selectionStart: number
				selectionDirection: "forward" | "backward" | "none"
				size: number
				webkitdirectory: boolean
				onchange: (this: HTMLInputElement, ev: Event) => any
			}
			ins: {
				cite: string
				dateTime: string
			}
			kbd: {}
			label: {
				htmlFor: string
			}
			legend: {
				/** @deprecated */
				align: Align
			}
			li: {
				/** @deprecated */
				type: "disc" | "square" | "circle"
				value: number
			}
			link: {
				as: string
				blocking: "render"
				/** @deprecated */
				charset: string
				crossOrigin: "anonymous" | "use-credentials" | ""
				disabled: boolean
				fetchPriority: "auto" | "high" | "low"
				href: string
				hreflang: string
				imageSizes: string
				imageSrcset: string
				integrity: string
				media: string
				referrerPolicy: ReferrerPolicy
				rel: "alternate" | "author" | "canonical" | "dns-prefetch" | "help" | "icon" | "license" | "manifest" | "me" | "modulepreload" | "next" | "pingback" | "preconnect" | "prefetch" | "preload" | "prev" | "search" | "stylesheet" | "apple-touch-icon"
				/** @deprecated */
				rev: string
				sizes: string
				/** @deprecated */
				target: string
				type: string
			}
			main: {
				shadowRootOptions: ShadowRootInit
			}
			map: {
				name: string
			}
			mark: {}
			menu: {
				/** @deprecated */
				compact: boolean
			}
			meta: {
				charset: string
				content: string
				httpEquiv: string
				media: string
				name: string
				/** @deprecated */
				scheme: string
			}
			meter: {
				high: number
				low: number
				max: number
				min: number
				optimum: number
				value: number
			}
			nav: {
				shadowRootOptions: ShadowRootInit
			}
			noscript: {}
			object: {
				/** @deprecated */
				align: Align
				/** @deprecated */
				archive: string
				/** @deprecated */
				border: string
				/** @deprecated */
				code: string
				/** @deprecated */
				codeBase: string
				/** @deprecated */
				codeType: string
				data: string
				/** @deprecated */
				declare: boolean
				height: string | number
				/** @deprecated */
				hspace: number
				name: string
				/** @deprecated */
				standby: string
				type: string
				useMap: string
				/** @deprecated */
				vspace: number
				width: string | number
			}
			ol: {
				/** @deprecated */
				compact: boolean
				reversed: boolean
				start: number
				type: "1" | "a" | "A" | "i" | "I"
			}
			optgroup: {
				disabled: string
				label: string
			}
			option: {
				defaultSelected: boolean
				disabled: boolean
				selected: boolean
				text: string
				value: string
			}
			output: {
				defaultValue: SVGStringList
				name: string
				value: string
			}
			p: {
				/** @deprecated */
				align: Align
				shadowRootOptions: ShadowRootInit
			}
			picture: {}
			pre: {
				/** @depricated */
				width: number
			}
			progress: {
				max: number
				value: string
			}
			q: {
				cite: string
			}
			rp: {}
			rt: {}
			ruby: {}
			s: {}
			samp: {}
			script: {
				async: boolean
				blocking: "render"
				crossOrigin: "anonymous" | "use-credentials" | ""
				/** @deprecated */
				charset: string
				defer: boolean
				/** @deprecated */
				event: string
				fetchPriority: "auto" | "high" | "low"
				/** @deprecated */
				htmlFor: string
				integrity: string
				noModule: boolean
				referrerPolicy: ReferrerPolicy
				src: string
				text: string
				type: string
			}
			section: {
				shadowRootOptions: ShadowRootInit
			}
			select: {
				autocomplete: Autocomplete
				autofocus: boolean
				disabled: boolean
				length: number
				multiple: boolean
				name: string
				required: boolean
				selectedIndex: number
				size: number
				value: string
				onchange: (this: HTMLSelectElement, ev: Event) => any
			}
			slot: {
				name: string
				onslotchange: (this: HTMLSlotElement, ev: Event) => any
			}
			small: {}
			source: {
				media: string
				sizes: string
				src: string
				srcset: string
				type: string
			}
			span: {
				shadowRootOptions: ShadowRootInit
			}
			strong: {}
			style: {
				blocking: "render"
				media: string
				/** @deprecated */
				type: string
				disabled: boolean
			}
			sup: {}
			table: {
				caption: JSX.Element
				tHead: JSX.Element
				tFoot: JSX.Element
				/** @deprecated */
				align: Align
				/** @deprecated */
				bgColor: string
				/** @deprecated */
				border: number
				/** @deprecated */
				cellPadding: string
				/** @deprecated */
				cellSpacing: string
				/** @deprecated */
				frame: "void" | "above" | "below" | "hsides" | "vsides" | "lhs" | "rhs" | "box" | "border"
				/** @deprecated */
				rules: "none" | "groups" | "rows" | "cols" | "all"
				/** @deprecated */
				summary: string
				/** @deprecated */
				width: string
			}
			tbody: {
				/** @deprecated */
				align: Align
				/** @deprecated */
				ch: string
				/** @deprecated */
				chOff: string
				vAlign: VAlign
			}
			td: {
				abbr: string
				/** @deprecated */
				align: Align
				/** @deprecated */
				axis: string
				/** @deprecated */
				bgColor: string
				/** @deprecated */
				ch: string
				/** @deprecated */
				chOff: string
				colSpan: number
				/** @deprecated */
				height: string
				/** @deprecated */
				noWrap: boolean
				rowSpan: number
				scope: "col" | "colgroup" | "row" | "rowgroup" | ""
				/** @deprecated */
				vAlign: VAlign
				/** @deprecated */
				width: string
			}
			template: {
				shadowRootMode: "open" | "closed"
				shadowRootDelegatesFocus: boolean
				shadowRootClonable: boolean
				shadowRootSerializable: boolean
			}
			textarea: {
				autocapitalize: "none" | "off" | "characters" | "words" | "sentences"
				autocomplete: "on" | "off" | ""
				autofocus: boolean
				cols: number
				defaultValue: string
				disabled: boolean
				maxLength: number
				minLength: number
				name: string
				placeholder: string
				readOnly: boolean
				required: boolean
				rows: number
				selectionDirection: "forward" | "backward" | "none"
				selectionEnd: number
				selectionStart: number
				value: string
				wrap: "hard" | "soft"
				onchange: (this: HTMLTextAreaElement, ev: Event) => any
			}
			tfoot: {
				/** @deprecated */
				align: Align
				/** @deprecated */
				ch: string
				/** @deprecated */
				chOff: string
				vAlign: VAlign
			}
			th: {
				abbr: string
				/** @deprecated */
				align: Align
				/** @deprecated */
				axis: string
				/** @deprecated */
				bgColor: string
				/** @deprecated */
				ch: string
				/** @deprecated */
				chOff: string
				colSpan: number
				/** @deprecated */
				height: string
				/** @deprecated */
				noWrap: boolean
				rowSpan: number
				scope: "col" | "colgroup" | "row" | "rowgroup" | ""
				/** @deprecated */
				vAlign: VAlign
				/** @deprecated */
				width: string
			}
			thead: {
				/** @deprecated */
				align: Align
				/** @deprecated */
				ch: string
				/** @deprecated */
				chOff: string
				vAlign: VAlign
			}
			time: {
				dateTime: string
			}
			title: {
				text: string
			}
			tr: {
				/** @deprecated */
				align: Align
				/** @deprecated */
				bgColor: string
				/** @deprecated */
				ch: string
				/** @deprecated */
				chOff: string
				/** @deprecated */
				vAlign: string
			}
			track: {
				kind: "subtitles" | "captions" | "descriptions" | "chapters" | "metadata"
				src: string
				srclang: string
				label: string
				default: boolean
				oncuechange: (this: HTMLTrackElement, ev: Event) => any
			}
			u: {}
			ul: {
				/** @deprecated */
				compact: boolean
				/** @deprecated */
				type: "circle" | "disc" | "square"
			}
			var: {}
			video: {
				autoPictureInPicture: boolean
				autoplay: boolean
				controls: boolean
				crossOrigin: "anonymous" | "use-credentials" | ""
				currentTime: number
				defaultMuted: boolean
				defaultPlaybackRate: number
				disablePictureInPicture: boolean
				disableRemotePlayback: boolean
				height: string | number
				loop: boolean
				muted: boolean
				playbackRate: number
				poster: string
				preload: "none" | "metadata" | "auto"
				preservesPitch: boolean
				src: string
				srcObject: MediaStream | MediaSource | Blob
				volume: number
				width: string | number
				onabort: (this: HTMLVideoElement, ev: UIEvent) => any
				oncanplay: (this: HTMLVideoElement, ev: Event) => any
				oncanplaythrough: (this: HTMLVideoElement, ev: Event) => any
				ondurationchange: (this: HTMLVideoElement, ev: Event) => any
				onemptied: (this: HTMLVideoElement, ev: Event) => any
				onended: (this: HTMLVideoElement, ev: Event) => any
				onloadeddata: (this: HTMLVideoElement, ev: Event) => any
				onloadedmetadata: (this: HTMLVideoElement, ev: Event) => any
				onloadstart: (this: HTMLVideoElement, ev: Event) => any
				onpause: (this: HTMLVideoElement, ev: Event) => any
				onplay: (this: HTMLVideoElement, ev: Event) => any
				onplaying: (this: HTMLVideoElement, ev: Event) => any
				onprogress: (this: HTMLVideoElement, ev: ProgressEvent<HTMLVideoElement>) => any
				onratechange: (this: HTMLVideoElement, ev: Event) => any
				onseeked: (this: HTMLVideoElement, ev: Event) => any
				onseeking: (this: HTMLVideoElement, ev: Event) => any
				onsuspend: (this: HTMLVideoElement, ev: Event) => any
				ontimeupdate: (this: HTMLVideoElement, ev: Event) => any
				onvolumechange: (this: HTMLVideoElement, ev: Event) => any
				onwaiting: (this: HTMLVideoElement, ev: Event) => any
				onencrypted: (this: HTMLVideoElement, ev: Event) => any
				onwaitingforkey: (this: HTMLVideoElement, ev: Event) => any
				onenterpictureinpicture: (this: HTMLVideoElement, ev: PictureInPictureEvent) => any
				onleavepictureinpicture: (this: HTMLVideoElement, ev: PictureInPictureEvent) => any
				onresize: (this: HTMLVideoElement, ev: Event) => any
			}
			wbr: {}
		}

		interface WritableSVGElementProps extends SVGTags {
			animate: {
				onbegin: (this: SVGAnimateElement, ev: Event) => any
				onend: (this: SVGAnimateElement, ev: Event) => any
				onrepeat: (this: SVGAnimateElement, ev: Event) => any
			}
			animateMotion: {
				onbegin: (this: SVGAnimateMotionElement, ev: Event) => any
				onend: (this: SVGAnimateMotionElement, ev: Event) => any
				onrepeat: (this: SVGAnimateMotionElement, ev: Event) => any
			}
			animateTransform: {
				onbegin: (this: SVGAnimateTransformElement, ev: Event) => any
				onend: (this: SVGAnimateTransformElement, ev: Event) => any
				onrepeat: (this: SVGAnimateTransformElement, ev: Event) => any
			}
			image: {
				decoding: "auto" | "sync" | "async"
			}
			set: {
				onbegin: (this: SVGAnimateTransformElement, ev: Event) => any
				onend: (this: SVGAnimateTransformElement, ev: Event) => any
				onrepeat: (this: SVGAnimateTransformElement, ev: Event) => any
			}
			svg: {
				currentScale: number
			}
		}

		// HTML attributes that need to be set with setAttribute
		// Likely some that are missing
		interface HTMLAttributes extends HTMLTags {
			button: {
				form: string
			}
			fieldset: {
				form: string
			}
			input: {
				form: string
				list: string
			}
			object: {
				form: string
			}
			output: {
				form: string
			}
			select: {
				form: string
			}
			textarea: {
				form: string
			}
		}

		// SVG attributes that need to be set with setAttribute
		// Likely some that are missing
		interface SVGAttributes extends SVGTags {
			animate: AnimationAttributes & {
				"color-interpolation": "auto" | "sRGB" | "linearRGB" | "inherit"
				systemLanguage: string
			}
			animateMotion: AnimationAttributes & {
				keyPoints: string
				path: string
				rotate: string
				systemLanguage: string
			}
			animateTransform: AnimationAttributes & {
				systemLanguage: string
				type: "translate" | "scale" | "rotate" | "skewX" | "skewY"
			}
			circle: CommonPresentationAttributes & {
				cx: string | number
				cy: string | number
				"marker-end": string
				"marker-mid": string
				"marker-start": string
				pathLength: string | number
				r: string | number
				systemLanguage: string
			}
			clipPath: CommonPresentationAttributes & {
				systemLanguage: string
			}
			defs: CommonPresentationAttributes & {
				/** @deprecated */
				"enable-background": string
				systemLanguage: string
			}
			desc: {}
			discard: {
				begin: string
				href: string
				systemLanguage: string
			}
			ellipse: CommonPresentationAttributes & {
				cx: string | number
				cy: string | number
				"marker-end": string
				"marker-mid": string
				"marker-start": string
				pathLength: string | number
				rx: string | number
				ry: string | number
				systemLanguage: string
			}
			feBlend: FilterAttributes & {
				"color-interpolation-filters": "auto" | "sRGB" | "linearRGB" | "inherit"
				in: string
				in2: string
				mode: "normal" | "multiply" | "screen" | "overlay" | "darken" | "lighten" | "color-dodge" | "color-burn" | "hard-light" | "soft-light" | "difference" | "exclusion" | "hue" | "saturation" | "color" | "luminosity"
			}
			feColorMatrix: FilterAttributes & {
				in: string
				type: "matrix" | "saturate" | "hueRotate" | "luminanaceToAlpha"
				values: string
			}
			feComponentTransfer: FilterAttributes & {
				in: string
			}
			feComposite: FilterAttributes & {
				in: string
				in2: string
				k1: string | number
				k2: string | number
				k3: string | number
				k4: string | number
				operator: "over" | "in" | "out" | "atop" | "xor" | "lighter" | "arithmetic"
			}
			feConvolveMatrix: FilterAttributes & {
				bias: string | number
				divisor: string | number
				edgeMode: "duplicate" | "wrap" | "none"
				in: string
				kernelMatrix: string
				/** @deprecated */
				kernelUnitLength: string | number
				order: string | number
				preserveAlpha: Booleanish
				targetX: string | number
				targetY: string | number
			}
			feDiffuseLighting: FilterAttributes & {
				diffuseConstant: string | number
				in: string
				/** @deprecated */
				kernelUnitLength: string | number
				"lighting-color": string
				surfaceScale: string | number
			}
			feDisplacementMap: FilterAttributes & {
				in: string
				in2: string
				scale: string | number
				xChannelSelector: "R" | "G" | "B" | "A"
				yChannelSelector: "R" | "G" | "B" | "A"
			}
			feDistantLight: {
				azimuth: string | number
				elevation: string | number
			}
			feDropShadow: FilterAttributes & {
				dx: string | number
				dy: string | number
				"flood-color": string
				"flood-opacity": string
				stdDeviation: string | number
			}
			feFlood: FilterAttributes & {
				"flood-color": string
				"flood-opacity": string
			}
			feFuncA: TransferFuncAttributes
			feFuncB: TransferFuncAttributes
			feFuncG: TransferFuncAttributes
			feFuncR: TransferFuncAttributes
			feGaussianBlur: FilterAttributes & {
				edgeMode: "duplicate" | "wrap" | "none"
				in: string
				stdDeviation: string | number
			}
			feImage: FilterAttributes & {
				href: string
				preserveAspectRatio: string
				crossorigin: "anonymous" | "use-credentials" | ""
			}
			feMerge: FilterAttributes
			feMergeNode: {
				in: string
				x: string | number
				y: string | number
			}
			feMorphology: FilterAttributes & {
				in: string
				operator: "erode" | "dilate"
				radius: string | number
			}
			feOffset: FilterAttributes & {
				dx: string | number
				dy: string | number
				in: string
			}
			fePointLight: {
				x: string | number
				y: string | number
				z: string | number
			}
			feSpecularLighting: FilterAttributes & {
				in: string
				"lighting-color": string
				/** @deprecated */
				kernelUnitLength: string | number
				specularConstant: string | number
				specularExponent: string | number
				surfaceScale: string | number
			}
			feSpotLight: {
				x: string | number
				y: string | number
				z: string | number
				pointsAtX: string | number
				pointsAtY: string | number
				pointsAtZ: string | number
				specularExponenet: string | number
				limitingConeAngle: string | number
			}
			feTile: FilterAttributes & {
				in: string
			}
			feTurbulence: FilterAttributes & {
				baseFrequency: string | number
				numOctaves: string | number
				seed: string | number
				stitchTiles: "noStitch" | "stitch"
				type: "fractalNoise" | "turbulence"
			}
			filter: CommonPresentationAttributes & {
				/** @deprecated */
				filterRes: string
				filterUnits: "userSpaceOnUse" | "objectBoundingBox"
				height: string | number
				href: string
				primitiveUnits: "userSpaceOnUse" | "objectBoundingBox"
				x: string | number
				y: string | number
			}
			foreignObject: CommonPresentationAttributes & {
				height: string | number
				overflow: "visible" | "hidden" | "scroll" | "auto" | "inherit"
				systemLanguage: string
				width: string | number
				x: string | number
				y: string | number
			}
			g: CommonPresentationAttributes & {
				/** @deprecated */
				"enable-background": string
				systemLanguage: string
			}
			image: CommonPresentationAttributes & {
				/** @deprecated */
				"color-profile": string
				crossorigin: "anonymous" | "use-credentials" | ""
				height: string | number
				href: string
				"image-rendering": "auto" | "optimizeQuality" | "optimizeSpeed"
				overflow: "visible" | "hidden" | "scroll" | "auto" | "inherit"
				preserveAspectRatio: string
				systemLanguage: string
				width: string | number
				x: string | number
				y: string | number
			}
			line: CommonPresentationAttributes & {
				"marker-end": string
				"marker-mid": string
				"marker-start": string
				pathLength: string | number
				systemLanguage: string
				x1: string | number
				x2: string | number
				y1: string | number
				y2: string | number
			}
			linearGradient: CommonPresentationAttributes & {
				gradientUnits: "userSpaceOnUse" | "objectBoundingBox"
				gradientTransform: string
				href: string
				spreadMethod: "pad" | "reflect" | "repeat"
				x1: string | number
				x2: string | number
				y1: string | number
				y2: string | number
			}
			marker: CommonPresentationAttributes & {
				markerHeight: string
				markerUnits: "useSpaceOnUse" | "strokeWidth"
				markerWidth: string
				orient: string
				overflow: "visible" | "hidden" | "scroll" | "auto" | "inherit"
				preserveAspectRatio: string
				refX: string
				refY: string
				viewBox: string
			}
			mask: CommonPresentationAttributes & {
				height: string | number
				maskContentUnits: "useSpaceOnUse" | "objectBoundingBox"
				maskUnits: "useSpaceOnUse" | "objectBoundingBox"
				systemLanguage: string
				x: string | number
				y: string | number
				width: string | number
			}
			metadata: {}
			mpath: {
				href: string
			}
			path: CommonPresentationAttributes & {
				d: string
				"marker-end": string
				"marker-mid": string
				"marker-start": string
				pathLength: string | number
				systemLanguage: string
			}
			pattern: CommonPresentationAttributes & {
				height: string | number
				href: string
				overflow: "visible" | "hidden" | "scroll" | "auto" | "inherit"
				patternContentUnits: "useSpaceOnUse" | "objectBoundingBox"
				patternTransform: string
				patternUnits: "useSpaceOnUse" | "objectBoundingBox"
				preserveAspectRatio: string
				systemLanguage: string
				viewBox: string
				width: string | number
				x: string | number
				y: string | number
			}
			polygon: CommonPresentationAttributes & {
				"marker-end": string
				"marker-mid": string
				"marker-start": string
				points: string
				pathLength: string | number
				systemLanguage: string
			}
		
			polyline: CommonPresentationAttributes & {
				"marker-end": string
				"marker-mid": string
				"marker-start": string
				points: string
				pathLength: string | number
				systemLanguage: string
			}
			radialGradient: CommonPresentationAttributes & {
				"color-interpolation": "auto" | "sRGB" | "linearRGB" | "inherit"
				cx: string | number
				cy: string | number
				fr: string | number
				fx: string | number
				fy: string | number
				gradientUnits: "useSpaceOnUse" | "objectBoundingBox"
				gradientTransform: string
				href: string
				r: string | number
				spreadMethod: "pad" | "reflect" | "repeat"
			}
			rect: CommonPresentationAttributes & {
				height: string | number
				"marker-end": string
				"marker-mid": string
				"marker-start": string
				pathLength: string | number
				rx: string | number
				ry: string | number
				systemLanguage: string
				width: string | number
				x: string | number
				y: string | number
			}
			set: {
				attributeName: string
				begin: string
				dur: string
				end: string
				fill: "freeze" | "remove"
				min: string
				max: string
				restart: "always" | "whenNotActive" | "never"
				repeatCount: number | "indefinite"
				repeatDur: string
				systemLanguage: string
				to: string
			}
			stop: {
				color: string
				display: string
				offset: string | number
				"stop-color": string
				"stop-opacity": string
				visibility: "visible" | "hidden" | "collapse" | "inherit"
			}
			svg: CommonPresentationAttributes & {
				/** @deprecated */
				baseProfile: string
				/** @deprecated */
				contentScriptValue: string
				/** @deprecated */
				contentStyleType: string
				height: string | number
				overflow: "visible" | "hidden" | "scroll" | "auto" | "inherit"
				preserveAspectRatio: string
				systemLanguage: string
				/** @deprecated */
				version: string
				viewBox: string
				width: string | number
				x: string | number
				y: string | number
			}
			switch: CommonPresentationAttributes & {
				/** @deprecated */
				"enable-background": string
				systemLanguage: string
			}
			symbol: CommonPresentationAttributes & {
				height: string | number
				overflow: "visible" | "hidden" | "scroll" | "auto" | "inherit"
				preserveAspectRatio: string
				refX: string
				refY: string
				viewBox: string
				width: string | number
				x: string | number
				y: string | number
			}
			text: CommonPresentationAttributes & TextAttributes & {
				dx: string | number
				dy: string | number
				lengthAdjust: "spacing" | "spacingAndGlyphs"
				overflow: "visible" | "hidden" | "scroll" | "auto" | "inherit"
				systemLanguage: string
				textLength: string
				"text-rendering": "auto" | "optimizeSpeed" | "optimizeLegibility" | "geometricPrecision" | "inherit"
				x: string | number
				y: string | number
			}
			textPath: CommonPresentationAttributes & TextAttributes & {
				"alignment-baseline": "auto" | "baseline" | "before-edge" | "text-before-edge" | "middle" | "central" | "after-edge" | "text-after-edge" | "ideographic" | "alphabetic" | "hanging" | "mathematical" | "inherit"
				"baseline-shift": string
				href: string
				method: "align" | "stretch"
				spacing: "auto" | "exact"
				startOffset: string
			}
			title: {}
			tspan: CommonPresentationAttributes & TextAttributes & {
				"alignment-baseline": "auto" | "baseline" | "before-edge" | "text-before-edge" | "middle" | "central" | "after-edge" | "text-after-edge" | "ideographic" | "alphabetic" | "hanging" | "mathematical" | "inherit"
				"baseline-shift": string
				dx: string | number
				dy: string | number
				
				rotate: string
				
				x: string | number
				y: string | number
			}
			use: {
				height: string | number
				href: string
				width: string | number
				systemLanguage: string
				x: string | number
				y: string | number
			}
			view: {
				viewBox: string
				preserveAspectRatio: string
				/** @deprecated */
				viewTarget: string
			}
		}

		interface MathMLAttributes extends MathMLTags {
			annotation: {
				encoding: string
				/** @deprecated */
				src: string
			}
			"annotation-xml": {
				encoding: string
				/** @deprecated */
				src: string
			}
			maction: {
				/** @deprecated */
				actiontype: "statusline" | "toggle"
				/** @deprecated */
				selection: string | number
			}
			math: {
				display: "block" | "inline"
			}
			merror: {}
			mfrac: {
				/** @deprecated */
				denomalign: "left" | "center" | "right"
				linetickness: string
				/** @deprecated */
				numalign: "left" | "center" | "right"
			}
			mi: {}
			mmultiscripts: {
				/** @deprecated */
				subscriptshift: string
				/** @deprecated */
				superscriptshift: string
			}
			mn: {}
			mo: {
				accent: Booleanish | ""
				fence: Booleanish | ""
				largeop: Booleanish | ""
				lspace: string
				maxsize: string
				minsize: string
				movablelimits: Booleanish | ""
				rspace: string
				separator: Booleanish | ""
				stretchy: Booleanish | ""
				symmetric: Booleanish | ""
			}
			mover: {
				accent: Booleanish | ""
			}
			mpadded: {
				depth: string
				height: string
				lspace: string
				voffset: string
				width: string
			}
			mphantom: {}
			mprescripts: {
				/** @deprecated */
				subscriptshift: string
				/** @deprecated */
				superscriptshift: string
			}
			mroot: {}
			mrow: {}
			ms: {
				/** @deprecated */
				lquote: string
				/** @deprecated */
				rquote: string
			}
			mspace: {
				depth: string
				height: string
				width: string
			}
			msqrt: {}
			mstyle: {
				/** @deprecated */
				background: string
				/** @deprecated */
				color: string
				/** @deprecated */
				fontsize: string
				/** @deprecated */
				fontstyle: string
				/** @deprecated */
				fontweight: string
				/** @deprecated */
				scriptminsize: string
				/** @deprecated */
				scriptsizemultiplier: string | number
			}
			msub: {
				/** @deprecated */
				subscriptshift: string
			}
			msubsup: {
				/** @deprecated */
				subscriptshift: string
				/** @deprecated */
				superscriptshift: string
			}
			msup: {
				/** @deprecated */
				superscriptshift: string
			}
			mtable: {
				align: "axis" | "baseline" | "bottom" | "center" | "top" | (string & {})
				columnalign: "left" | "center" | "right" | (string & {})
				columnlines: "none" | "solid" | "dashed" | (string & {})
				columnspacing: string
				frame: "none" | "solid" | "dashed"
				framespacing: string
				rowalign: "axis" | "baseline" | "bottom" | "center" | "top" | (string & {})
				rowlines: "none" | "solid" | "dashed" | (string & {})
				rowspacing: string
				width: string
			}
			mtd: {
				columnspan: string | number
				columnalign: "left" | "center" | "right"
				rowspan: string | number
				rowalign: "axis" | "baseline" | "bottom" | "center" | "top"
			}
			mtext: {}
			mtr: {
				columnalign: "left" | "center" | "right" | (string & {})
				rowalign: "axis" | "baseline" | "bottom" | "center" | "top"
			}
			munder: {
				accentunder: Booleanish | ""
			}
			munderover: {
				accent: Booleanish | ""
				accentunder: Booleanish | ""
			}
			semantics: {}
		}
	}
}

export { element, fragment, ref, element as createElement, fragment as Fragment, element as h, appendChildren, addSVGSupport, addMathMLSupport }
