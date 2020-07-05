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

  type PartialWithExtra<T> = Partial<T & { role: string }>;
  interface IntrinsicElements {
    [elemName: string]: unknown;
    a: PartialWithExtra<HTMLAnchorElement>;
    abbr: PartialWithExtra<HTMLElement>;
    address: PartialWithExtra<HTMLElement>;
    applet: PartialWithExtra<HTMLAppletElement>;
    area: PartialWithExtra<HTMLAreaElement>;
    article: PartialWithExtra<HTMLElement>;
    aside: PartialWithExtra<HTMLElement>;
    audio: PartialWithExtra<HTMLAudioElement>;
    b: PartialWithExtra<HTMLElement>;
    base: PartialWithExtra<HTMLBaseElement>;
    basefont: PartialWithExtra<HTMLBaseFontElement>;
    bdi: PartialWithExtra<HTMLElement>;
    bdo: PartialWithExtra<HTMLElement>;
    blockquote: PartialWithExtra<HTMLQuoteElement>;
    body: PartialWithExtra<HTMLBodyElement>;
    br: PartialWithExtra<HTMLBRElement>;
    button: PartialWithExtra<HTMLButtonElement>;
    canvas: PartialWithExtra<HTMLCanvasElement>;
    caption: PartialWithExtra<HTMLTableCaptionElement>;
    cite: PartialWithExtra<HTMLElement>;
    code: PartialWithExtra<HTMLElement>;
    col: PartialWithExtra<HTMLTableColElement>;
    colgroup: PartialWithExtra<HTMLTableColElement>;
    data: PartialWithExtra<HTMLDataElement>;
    datalist: PartialWithExtra<HTMLDataListElement>;
    dd: PartialWithExtra<HTMLElement>;
    del: PartialWithExtra<HTMLModElement>;
    details: PartialWithExtra<HTMLDetailsElement>;
    dfn: PartialWithExtra<HTMLElement>;
    dialog: PartialWithExtra<HTMLDialogElement>;
    dir: PartialWithExtra<HTMLDirectoryElement>;
    div: PartialWithExtra<HTMLDivElement>;
    dl: PartialWithExtra<HTMLDListElement>;
    dt: PartialWithExtra<HTMLElement>;
    em: PartialWithExtra<HTMLElement>;
    embed: PartialWithExtra<HTMLEmbedElement>;
    fieldset: PartialWithExtra<HTMLFieldSetElement>;
    figcaption: PartialWithExtra<HTMLElement>;
    figure: PartialWithExtra<HTMLElement>;
    font: PartialWithExtra<HTMLFontElement>;
    footer: PartialWithExtra<HTMLElement>;
    form: PartialWithExtra<HTMLFormElement>;
    frame: PartialWithExtra<HTMLFrameElement>;
    frameset: PartialWithExtra<HTMLFrameSetElement>;
    h1: PartialWithExtra<HTMLHeadingElement>;
    h2: PartialWithExtra<HTMLHeadingElement>;
    h3: PartialWithExtra<HTMLHeadingElement>;
    h4: PartialWithExtra<HTMLHeadingElement>;
    h5: PartialWithExtra<HTMLHeadingElement>;
    h6: PartialWithExtra<HTMLHeadingElement>;
    head: PartialWithExtra<HTMLHeadElement>;
    header: PartialWithExtra<HTMLElement>;
    hgroup: PartialWithExtra<HTMLElement>;
    hr: PartialWithExtra<HTMLHRElement>;
    html: PartialWithExtra<HTMLHtmlElement>;
    i: PartialWithExtra<HTMLElement>;
    iframe: PartialWithExtra<HTMLIFrameElement>;
    img: PartialWithExtra<HTMLImageElement>;
    input: PartialWithExtra<HTMLInputElement>;
    ins: PartialWithExtra<HTMLModElement>;
    kbd: PartialWithExtra<HTMLElement>;
    label: PartialWithExtra<HTMLLabelElement>;
    legend: PartialWithExtra<HTMLLegendElement>;
    li: PartialWithExtra<HTMLLIElement>;
    link: PartialWithExtra<HTMLLinkElement>;
    main: PartialWithExtra<HTMLElement>;
    map: PartialWithExtra<HTMLMapElement>;
    mark: PartialWithExtra<HTMLElement>;
    marquee: PartialWithExtra<HTMLMarqueeElement>;
    menu: PartialWithExtra<HTMLMenuElement>;
    meta: PartialWithExtra<HTMLMetaElement>;
    meter: PartialWithExtra<HTMLMeterElement>;
    nav: PartialWithExtra<HTMLElement>;
    noscript: PartialWithExtra<HTMLElement>;
    object: PartialWithExtra<HTMLObjectElement>;
    ol: PartialWithExtra<HTMLOListElement>;
    optgroup: PartialWithExtra<HTMLOptGroupElement>;
    option: PartialWithExtra<HTMLOptionElement>;
    output: PartialWithExtra<HTMLOutputElement>;
    p: PartialWithExtra<HTMLParagraphElement>;
    param: PartialWithExtra<HTMLParamElement>;
    picture: PartialWithExtra<HTMLPictureElement>;
    pre: PartialWithExtra<HTMLPreElement>;
    progress: PartialWithExtra<HTMLProgressElement>;
    q: PartialWithExtra<HTMLQuoteElement>;
    rp: PartialWithExtra<HTMLElement>;
    rt: PartialWithExtra<HTMLElement>;
    ruby: PartialWithExtra<HTMLElement>;
    s: PartialWithExtra<HTMLElement>;
    samp: PartialWithExtra<HTMLElement>;
    script: PartialWithExtra<HTMLScriptElement>;
    section: PartialWithExtra<HTMLElement>;
    select: PartialWithExtra<HTMLSelectElement>;
    slot: PartialWithExtra<HTMLSlotElement>;
    small: PartialWithExtra<HTMLElement>;
    source: PartialWithExtra<HTMLSourceElement>;
    span: PartialWithExtra<HTMLSpanElement>;
    strong: PartialWithExtra<HTMLElement>;
    style: PartialWithExtra<HTMLStyleElement>;
    sub: PartialWithExtra<HTMLElement>;
    summary: PartialWithExtra<HTMLElement>;
    sup: PartialWithExtra<HTMLElement>;
    table: PartialWithExtra<HTMLTableElement>;
    tbody: PartialWithExtra<HTMLTableSectionElement>;
    td: PartialWithExtra<HTMLTableDataCellElement>;
    template: PartialWithExtra<HTMLTemplateElement>;
    textarea: PartialWithExtra<HTMLTextAreaElement>;
    tfoot: PartialWithExtra<HTMLTableSectionElement>;
    th: PartialWithExtra<HTMLTableHeaderCellElement>;
    thead: PartialWithExtra<HTMLTableSectionElement>;
    time: PartialWithExtra<HTMLTimeElement>;
    title: PartialWithExtra<HTMLTitleElement>;
    tr: PartialWithExtra<HTMLTableRowElement>;
    track: PartialWithExtra<HTMLTrackElement>;
    u: PartialWithExtra<HTMLElement>;
    ul: PartialWithExtra<HTMLUListElement>;
    var: PartialWithExtra<HTMLElement>;
    video: PartialWithExtra<HTMLVideoElement>;
    wbr: PartialWithExtra<HTMLElement>;
  }
}
