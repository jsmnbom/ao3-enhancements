declare namespace JSX {
  type Element = SVGElement &
    HTMLElement &
    HTMLAnchorElement &
    // HTMLAppletElement &
    // HTMLAreaElement &
    // HTMLAudioElement &
    // HTMLBaseElement &
    // HTMLBaseFontElement &
    // HTMLQuoteElement &
    // HTMLBodyElement &
    // HTMLBRElement &
    // HTMLButtonElement &
    // HTMLCanvasElement &
    // HTMLTableCaptionElement &
    // HTMLTableColElement &
    // HTMLTableColElement &
    // HTMLDataElement &
    // HTMLDataListElement &
    // HTMLModElement &
    // HTMLDetailsElement &
    // HTMLDialogElement &
    // HTMLDirectoryElement &
    HTMLDivElement &
    // HTMLDListElement &
    // HTMLEmbedElement &
    // HTMLFieldSetElement &
    // HTMLFontElement &
    // HTMLFormElement &
    // HTMLFrameElement &
    // HTMLFrameSetElement &
    // HTMLHeadingElement &
    // HTMLHeadElement &
    // HTMLHRElement &
    // HTMLIFrameElement &
    // HTMLImageElement &
    // HTMLInputElement &
    // HTMLModElement &
    // HTMLLabelElement &
    // HTMLLegendElement &
    // HTMLLIElement &
    // HTMLLinkElement &
    // HTMLMapElement &
    // HTMLMarqueeElement &
    // HTMLMenuElement &
    // HTMLMetaElement &
    // HTMLMeterElement &
    // HTMLObjectElement &
    // HTMLOListElement &
    // HTMLOptGroupElement &
    // HTMLOptionElement &
    // HTMLOutputElement &
    // HTMLParagraphElement &
    // HTMLParamElement &
    // HTMLPictureElement &
    // HTMLPreElement &
    // HTMLProgressElement &
    // HTMLQuoteElement &
    // HTMLScriptElement &
    // HTMLSelectElement &
    // HTMLSlotElement &
    // HTMLSourceElement &
    // HTMLSpanElement &
    // HTMLStyleElement &
    // HTMLTableElement &
    // HTMLTableSectionElement &
    // HTMLTableDataCellElement &
    // HTMLTemplateElement &
    // HTMLTextAreaElement &
    // HTMLTableSectionElement &
    // HTMLTableHeaderCellElement &
    // HTMLTableSectionElement &
    // HTMLTimeElement &
    // HTMLTitleElement &
    // HTMLTableRowElement &
    // HTMLTrackElement &
    // HTMLUListElement &
    // HTMLVideoElement &
    // SVGAElement &
    // SVGCircleElement &
    // SVGClipPathElement &
    // SVGDefsElement &
    // SVGDescElement &
    // SVGEllipseElement &
    // SVGFEBlendElement &
    // SVGFEColorMatrixElement &
    // SVGFEComponentTransferElement &
    // SVGFECompositeElement &
    // SVGFEConvolveMatrixElement &
    // SVGFEDiffuseLightingElement &
    // SVGFEDisplacementMapElement &
    // SVGFEDistantLightElement &
    // SVGFEFloodElement &
    // SVGFEFuncAElement &
    // SVGFEFuncBElement &
    // SVGFEFuncGElement &
    // SVGFEFuncRElement &
    // SVGFEGaussianBlurElement &
    // SVGFEImageElement &
    // SVGFEMergeElement &
    // SVGFEMergeNodeElement &
    // SVGFEMorphologyElement &
    // SVGFEOffsetElement &
    // SVGFEPointLightElement &
    // SVGFESpecularLightingElement &
    // SVGFESpotLightElement &
    // SVGFETileElement &
    // SVGFETurbulenceElement &
    // SVGFilterElement &
    // SVGForeignObjectElement &
    // SVGGElement &
    // SVGImageElement &
    // SVGLineElement &
    // SVGLinearGradientElement &
    // SVGMarkerElement &
    // SVGMaskElement &
    // SVGMetadataElement &
    // SVGPathElement &
    // SVGPatternElement &
    // SVGPolygonElement &
    // SVGPolylineElement &
    // SVGRadialGradientElement &
    // SVGRectElement &
    // SVGScriptElement &
    // SVGStopElement &
    // SVGStyleElement &
    // SVGSVGElement &
    // SVGSwitchElement &
    // SVGSymbolElement &
    // SVGTextElement &
    // SVGTextPathElement &
    // SVGTitleElement &
    // SVGTSpanElement &
    // SVGUseElement &
    // SVGViewElement &
    DocumentFragment;
  interface IntrinsicElements {
    [elemName: string]: unknown;
    a: Partial<HTMLAnchorElement>;
    abbr: Partial<HTMLElement>;
    address: Partial<HTMLElement>;
    applet: Partial<HTMLAppletElement>;
    area: Partial<HTMLAreaElement>;
    article: Partial<HTMLElement>;
    aside: Partial<HTMLElement>;
    audio: Partial<HTMLAudioElement>;
    b: Partial<HTMLElement>;
    base: Partial<HTMLBaseElement>;
    basefont: Partial<HTMLBaseFontElement>;
    bdi: Partial<HTMLElement>;
    bdo: Partial<HTMLElement>;
    blockquote: Partial<HTMLQuoteElement>;
    body: Partial<HTMLBodyElement>;
    br: Partial<HTMLBRElement>;
    button: Partial<HTMLButtonElement>;
    canvas: Partial<HTMLCanvasElement>;
    caption: Partial<HTMLTableCaptionElement>;
    cite: Partial<HTMLElement>;
    code: Partial<HTMLElement>;
    col: Partial<HTMLTableColElement>;
    colgroup: Partial<HTMLTableColElement>;
    data: Partial<HTMLDataElement>;
    datalist: Partial<HTMLDataListElement>;
    dd: Partial<HTMLElement>;
    del: Partial<HTMLModElement>;
    details: Partial<HTMLDetailsElement>;
    dfn: Partial<HTMLElement>;
    dialog: Partial<HTMLDialogElement>;
    dir: Partial<HTMLDirectoryElement>;
    div: Partial<HTMLDivElement & { role: string }>;
    dl: Partial<HTMLDListElement>;
    dt: Partial<HTMLElement>;
    em: Partial<HTMLElement>;
    embed: Partial<HTMLEmbedElement>;
    fieldset: Partial<HTMLFieldSetElement>;
    figcaption: Partial<HTMLElement>;
    figure: Partial<HTMLElement>;
    font: Partial<HTMLFontElement>;
    footer: Partial<HTMLElement>;
    form: Partial<HTMLFormElement>;
    frame: Partial<HTMLFrameElement>;
    frameset: Partial<HTMLFrameSetElement>;
    h1: Partial<HTMLHeadingElement>;
    h2: Partial<HTMLHeadingElement>;
    h3: Partial<HTMLHeadingElement>;
    h4: Partial<HTMLHeadingElement>;
    h5: Partial<HTMLHeadingElement>;
    h6: Partial<HTMLHeadingElement>;
    head: Partial<HTMLHeadElement>;
    header: Partial<HTMLElement>;
    hgroup: Partial<HTMLElement>;
    hr: Partial<HTMLHRElement>;
    html: Partial<HTMLHtmlElement>;
    i: Partial<HTMLElement>;
    iframe: Partial<HTMLIFrameElement>;
    img: Partial<HTMLImageElement>;
    input: Partial<HTMLInputElement>;
    ins: Partial<HTMLModElement>;
    kbd: Partial<HTMLElement>;
    label: Partial<HTMLLabelElement>;
    legend: Partial<HTMLLegendElement>;
    li: Partial<HTMLLIElement>;
    link: Partial<HTMLLinkElement>;
    main: Partial<HTMLElement>;
    map: Partial<HTMLMapElement>;
    mark: Partial<HTMLElement>;
    marquee: Partial<HTMLMarqueeElement>;
    menu: Partial<HTMLMenuElement>;
    meta: Partial<HTMLMetaElement>;
    meter: Partial<HTMLMeterElement>;
    nav: Partial<HTMLElement>;
    noscript: Partial<HTMLElement>;
    object: Partial<HTMLObjectElement>;
    ol: Partial<HTMLOListElement>;
    optgroup: Partial<HTMLOptGroupElement>;
    option: Partial<HTMLOptionElement>;
    output: Partial<HTMLOutputElement>;
    p: Partial<HTMLParagraphElement>;
    param: Partial<HTMLParamElement>;
    picture: Partial<HTMLPictureElement>;
    pre: Partial<HTMLPreElement>;
    progress: Partial<HTMLProgressElement>;
    q: Partial<HTMLQuoteElement>;
    rp: Partial<HTMLElement>;
    rt: Partial<HTMLElement>;
    ruby: Partial<HTMLElement>;
    s: Partial<HTMLElement>;
    samp: Partial<HTMLElement>;
    script: Partial<HTMLScriptElement>;
    section: Partial<HTMLElement>;
    select: Partial<HTMLSelectElement>;
    slot: Partial<HTMLSlotElement>;
    small: Partial<HTMLElement>;
    source: Partial<HTMLSourceElement>;
    span: Partial<HTMLSpanElement>;
    strong: Partial<HTMLElement>;
    style: Partial<HTMLStyleElement>;
    sub: Partial<HTMLElement>;
    summary: Partial<HTMLElement>;
    sup: Partial<HTMLElement>;
    table: Partial<HTMLTableElement>;
    tbody: Partial<HTMLTableSectionElement>;
    td: Partial<HTMLTableDataCellElement>;
    template: Partial<HTMLTemplateElement>;
    textarea: Partial<HTMLTextAreaElement>;
    tfoot: Partial<HTMLTableSectionElement>;
    th: Partial<HTMLTableHeaderCellElement>;
    thead: Partial<HTMLTableSectionElement>;
    time: Partial<HTMLTimeElement>;
    title: Partial<HTMLTitleElement>;
    tr: Partial<HTMLTableRowElement>;
    track: Partial<HTMLTrackElement>;
    u: Partial<HTMLElement>;
    ul: Partial<HTMLUListElement>;
    var: Partial<HTMLElement>;
    video: Partial<HTMLVideoElement>;
    wbr: Partial<HTMLElement>;
  }
}
