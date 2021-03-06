Latest
======

 * [#481](https://github.com/jumpinjackie/mapguide-react-layout/issues/481): Current selection set now also stashed to local storage to persist (and be restored) between browser refreshes.
 * [#645](https://github.com/jumpinjackie/mapguide-react-layout/issues/645): Viewer CSS is now extracted out to a 
 separate asset (instead of integrated with the JS bundle)
   * As part of this change, workaround a potential infinite loop if the error icon asset could not be found by adding an inline base64 copy of this icon.
 * [#596](https://github.com/jumpinjackie/mapguide-react-layout/issues/596): Add copy link button to ShareLinkToView widget (via `react-copy-to-clipboard`)
 * [#631](https://github.com/jumpinjackie/mapguide-react-layout/issues/631): Fix init failure if appdef has an empty widget container
 * [#595](https://github.com/jumpinjackie/mapguide-react-layout/issues/595): Fix line measurement total showing units in m^2
 * [#593](https://github.com/jumpinjackie/mapguide-react-layout/issues/593): Fix measure tool starting measuring when switching measurement type
 * [#643](https://github.com/jumpinjackie/mapguide-react-layout/issues/643): Added basic e2e test suite. Powered by `testcafe`
 * [#698](https://github.com/jumpinjackie/mapguide-react-layout/issues/698): Fix memory leak due to dangling measure components being held on by the measure context after unmount
 * [#569](https://github.com/jumpinjackie/mapguide-react-layout/issues/569): Update to use `componentDidUpdate` instead of `componentWillReceiveProps`
 * [#690](https://github.com/jumpinjackie/mapguide-react-layout/issues/690): Made redux action more strongly-typed
 * Updated Blueprint to 1.36.0
 * Updated TypeScript to 3.0.1
 * Updated React to 16.4.2
 * Replaced `query-string` module with `qs`
 * Now built with webpack 4.x

0.11.2
======

[Changelog](https://github.com/jumpinjackie/mapguide-react-layout/compare/v0.11.1...v0.11.2)

 * Updated OpenLayers to 4.6.5
 * [#562](https://github.com/jumpinjackie/mapguide-react-layout/issues/562): More scalable vertical text CSS for sidebar template
 * [#566](https://github.com/jumpinjackie/mapguide-react-layout/issues/566): Fix QuickPlot not working without toggling print box first

0.11.1
======

[Changelog](https://github.com/jumpinjackie/mapguide-react-layout/compare/v0.11.0...v0.11.1)

 * [#476](https://github.com/jumpinjackie/mapguide-react-layout/issues/476): Fix tiled base layer group initial visibility not being respected

0.11.0
======

[Changelog](https://github.com/jumpinjackie/mapguide-react-layout/compare/v0.10.0...v0.11.0)

 * Updated React to 16.2
 * Updated Blueprint to 1.35.5
 * Updated OpenLayers to 4.6.4
 * Updated TypeScript to 2.7.2
 * [#481](https://github.com/jumpinjackie/mapguide-react-layout/issues/481): Partial application state now pushed to URL, making a browser reload effectively "resume" from where you left off.
   * Current view
   * Active map (if multiple maps are present)
   * Shown/Hidden group and layer names
   * Current session id
 * Template changes:
   * [#516](https://github.com/jumpinjackie/mapguide-react-layout/issues/516): AJAX Viewer now looks more like the original.
   * [#64](https://github.com/jumpinjackie/mapguide-react-layout/issues/64): Sidebar now resizable for `slate`, `maroon`, `limegold` and `turquoiseyellow` templates.
     * Sidebar now can properly collapse/hide if all 3 child elements (Task Pane, Selection, Legend) are all set to be hidden.
 * [#192](https://github.com/jumpinjackie/mapguide-react-layout/issues/192): Measure tool now displays segment lengths (and total length/area) of active measure
 * [#304](https://github.com/jumpinjackie/mapguide-react-layout/issues/304): Broken/404 toolbar/menu icons now gracefully show an error icon in its place.
 * [#475](https://github.com/jumpinjackie/mapguide-react-layout/issues/475): Support for manual tooltip display (ie. click to show tooltip instead of selecting)
 * [#244](https://github.com/jumpinjackie/mapguide-react-layout/issues/244): Flyouts are now mutually exclusive, making them behave more like their Fusion counterparts.
 * [#243](https://github.com/jumpinjackie/mapguide-react-layout/issues/243): Port across additional Fusion widgets
   * `CenterSelection`
 * [#239](https://github.com/jumpinjackie/mapguide-react-layout/issues/239) Port across additional extension parameter support for the following Fusion widgets:
   * `Redline`
   * `SelectPolygon`
 * [#30](https://github.com/jumpinjackie/mapguide-react-layout/issues/30): Support for taskpane/infopane width elements of a Web Layout (only recognized by the `ajax-viewer` template).
 * [#477](https://github.com/jumpinjackie/mapguide-react-layout/issues/477): Selection panel now supports HTML property values (through a new `selectionSettings.allowHtmlValues` mount option)
   * For un-trusted content, a mount option `selectionSettings.cleanHtml` is available to provide a content sanitization function.
 * [#518](https://github.com/jumpinjackie/mapguide-react-layout/issues/518): Debug viewer bundle (`viewer-debug.js`) now included
 * [#531](https://github.com/jumpinjackie/mapguide-react-layout/issues/531): Improved digitization controls:
   * Support undoing last drawn point by pressing the `U` key
   * New mount options for customizing keybindings for cancelling digitization (default: `ESC`) and undoing last point (default: `U`)
 * New components accessible through the existing InvokeURL mechanism:
   * [#528](https://github.com/jumpinjackie/mapguide-react-layout/issues/528): Share link to current view (`component://ShareLinkToView`)
   * [#324](https://github.com/jumpinjackie/mapguide-react-layout/issues/324): Add external WMS layers (`component://AddManageLayers`)
 * [#526](https://github.com/jumpinjackie/mapguide-react-layout/issues/526): Viewer now uses OL `PluggableMap` for reduced bundle size
 * [#517](https://github.com/jumpinjackie/mapguide-react-layout/issues/517): Fix: Commands now fall back to running in modal dialog if Task Pane is not present.
 * [#383](https://github.com/jumpinjackie/mapguide-react-layout/issues/383): Fix: Initial rendered map does not cover full viewport.
 * API changes:
   * [#532](https://github.com/jumpinjackie/mapguide-react-layout/issues/532): IMapViewer.setFeatureTooltipEnabled() now properly flows state to the redux store (properly updating any components that care about whether feature tooltips are enabled or not)
   * [#533](https://github.com/jumpinjackie/mapguide-react-layout/issues/533): Added ability to create select and modify interactions in OL factory
   * [#4](https://github.com/jumpinjackie/mapguide-react-layout/issues/4): Full AJAX Viewer map frame API parity
 * NPM module changes:
   * No longer includes `@types/*` packages as dependencies to avoid "dll-hell" with conflicting typings. You can install your own typings for React, etc.

0.10.0
======

[Changelog](https://github.com/jumpinjackie/mapguide-react-layout/compare/v0.9.6...v0.10.0)
 * Updated OpenLayers to 4.3.2
 * Update TypeScript to 2.5
 * Update Blueprint to 1.27
 * [#188](https://github.com/jumpinjackie/mapguide-react-layout/issues/188): QuickPlot now supports box rotation via a numerical slider
 * [#6](https://github.com/jumpinjackie/mapguide-react-layout/issues/6): Selection Panel component now highlights the currently selected feature (when multiple features are selected)
 * [#325](https://github.com/jumpinjackie/mapguide-react-layout/issues/325): New persistent busy loading indicator
 * [#36](https://github.com/jumpinjackie/mapguide-react-layout/issues/36): NPM module now supports customizable Selection Panel body rendering
 * [#97](https://github.com/jumpinjackie/mapguide-react-layout/issues/97): Port across Coordinate Tracker widget from Fusion
 * [#11](https://github.com/jumpinjackie/mapguide-react-layout/issues/11): Port across view size status bar component
 * [#329](https://github.com/jumpinjackie/mapguide-react-layout/issues/329): Removed es6-promise from the main viewer bundle. This is now loaded as a separate script from all the entry-point HTML templates. If you do not care to support Internet Explorer, you can remove this script reference.
 * [#63](https://github.com/jumpinjackie/mapguide-react-layout/issues/63): New init warnings reducer, this is used to display warnings about:
   * Missing Bing Maps API key
   * Unknown Bing Maps layers
   * Usage of Google Maps (not supported in mapguide-react-layout)
 * [#239](https://github.com/jumpinjackie/mapguide-react-layout/issues/239): Full extension property support for Fusion `CursorPosition`
 * API: [#337](https://github.com/jumpinjackie/mapguide-react-layout/issues/337): `locale` now supported as a `mount()` option.
 * API: [#332](https://github.com/jumpinjackie/mapguide-react-layout/issues/332): Everything can now be imported directly from the `mapguide-react-layout` NPM module (eg. This is now a legal import: `import { ApplicationViewModel } from "mapguide-react-layout"`). Piecemeal imports is still available.
 * API: [#318](https://github.com/jumpinjackie/mapguide-react-layout/issues/318): NPM module support for adding in custom application-specific reducers
 * API: [#150](https://github.com/jumpinjackie/mapguide-react-layout/issues/150): New APIs for `MapGuide.Application`:
   * A new `onInit` mount option that's called once the application is initialized
   * A new `getCommand(name)` function to get a registered command by name
   * [#305](https://github.com/jumpinjackie/mapguide-react-layout/issues/305): Expose redux `dispatch()` to allow redux actions to be dispatched from a browser globals context
      * All redux action available under `MapGuide.Actions`
 * API: Added extra factories for `ol.Collection` and `ol.interaction.translate`
 * API: New `IMapViewer` APIs for:
   * Getting name of the current runtime map
   * Enabling/disabling view rotation
   * Setting/getting the current view rotation
 * Docs: API docs now versioned (from 0.9.6 onwards)

0.9.6
=====

[Changelog](https://github.com/jumpinjackie/mapguide-react-layout/compare/v0.9.5...v0.9.6)

 * [#300](https://github.com/jumpinjackie/mapguide-react-layout/issues/300): Use `async`/`await` to simplify init and mapagent request code.
   * API: Removed `IPromise<T>`. All references to `IPromise<T>` now reference standard `Promise<T>` to support `async`/`await`
 * [#302](https://github.com/jumpinjackie/mapguide-react-layout/issues/302): Fix transparency toggler for maps with no external base layer configuration.
 * API: Image/cursor file references moved from `utils/asset` to `constants/assets`

0.9.5
=====

[Changelog](https://github.com/jumpinjackie/mapguide-react-layout/compare/v0.9.1...v0.9.5)

 * [#250](https://github.com/jumpinjackie/mapguide-react-layout/issues/250): Added support for toggling layer transparency (via Viewer Options)
 * API: Added OL factories for creating extent and snap interactions
 * [#111](https://github.com/jumpinjackie/mapguide-react-layout/issues/111): Ensure that scales of new views "snap" to the closest finite scale when viewing a tiled map
 * [#252](https://github.com/jumpinjackie/mapguide-react-layout/issues/252): Fix tooltip queries being sent with points instead of pixel-buffered polygons
 * [#239](https://github.com/jumpinjackie/mapguide-react-layout/issues/239): 
   * Support element target (New Window / Task Pane / Specific Frame) for commands
   * Expanded extension property support for select Fusion widgets
 * [#22](https://github.com/jumpinjackie/mapguide-react-layout/issues/22): Added sprite icon support. Any icon currently in the default Fusion image sprite is supported here.
 * [#276](https://github.com/jumpinjackie/mapguide-react-layout/issues/276): 
   * New standardized path (`dist/stdassets`) for all content assets (images/icons/fonts/etc)
   * Command/Flyout icon settings are now respected.
   * [#295](https://github.com/jumpinjackie/mapguide-react-layout/issues/295): Some helpers to ensure proper asset path resolution when using the npm module
 * Legend now properly renders layers with multiple geometry styles
 * Fix: Fusion MapMessage compat not spawning equivalent blueprint toast alerts
 * [#290](https://github.com/jumpinjackie/mapguide-react-layout/issues/290): Fix flyout menus requiring double-click to re-open
 * [#277](https://github.com/jumpinjackie/mapguide-react-layout/issues/277): Fix excessive blueprint toaster components created when using toast alerts


0.9.1
=====

[Changelog](https://github.com/jumpinjackie/mapguide-react-layout/compare/v0.9...v0.9.1)

 * Update blueprint to 1.21.0
 * Update OpenLayers to 4.2.0
 * Update React to 15.6.1
 * [#261](https://github.com/jumpinjackie/mapguide-react-layout/issues/261): Now built with Webpack 3 with scope hoisting support for faster bundle loading and slightly smaller bundle size
 * [#251](https://github.com/jumpinjackie/mapguide-react-layout/issues/251): Fix inability to interact with tooltip content
 * [#262](https://github.com/jumpinjackie/mapguide-react-layout/issues/262): Fix refresh not rebuilding legend
 * [#246](https://github.com/jumpinjackie/mapguide-react-layout/issues/246): Support for setting initial template element visibility when mounting

0.9
===

[Changelog](https://github.com/jumpinjackie/mapguide-react-layout/compare/v0.8...v0.9)

 * Update blueprint to 1.17.1
 * Update to React 15.5.4
 * [#210](https://github.com/jumpinjackie/mapguide-react-layout/issues/210): Now using TypeScript 2.3.2
 * Update OpenLayers to 4.1.1
   * [#126](https://github.com/jumpinjackie/mapguide-react-layout/issues/126): Now using `ol` npm package with ES2015 modules. As a result the viewer bundle now only carries parts of OpenLayers that are actually used
   * [#155](https://github.com/jumpinjackie/mapguide-react-layout/issues/155): To support viewer APIs that require OL types as input parameters, a new object factory API is provided to create any required OL type.
 * Now available as a [npm module](https://www.npmjs.com/package/mapguide-react-layout). Use the npm module if you need to customize the viewer with:
   * Additional layout templates
   * Custom script commands
   * Removing un-used features from the viewer bundle
   * Check out [this example](https://github.com/jumpinjackie/mapguide-react-layout-example) to see how the npm module is used
 * [#50](https://github.com/jumpinjackie/mapguide-react-layout/issues/50): API documentation (provided by [Typedoc](https://github.com/TypeStrong/typedoc))
 * [#125](https://github.com/jumpinjackie/mapguide-react-layout/issues/125): New [project landing page](https://jumpinjackie.github.io/mapguide-react-layout)
 * [#189](https://github.com/jumpinjackie/mapguide-react-layout/issues/189): Added support for Bing Maps as external base layers
 * [#121](https://github.com/jumpinjackie/mapguide-react-layout/issues/121): Ported testing infrastructure over to jest
 * [#99](https://github.com/jumpinjackie/mapguide-react-layout/issues/99): Now built using Webpack 2.x
 * [#124](https://github.com/jumpinjackie/mapguide-react-layout/issues/124): Set up greenkeeper.io service
 * [#224](https://github.com/jumpinjackie/mapguide-react-layout/issues/224): The following tools now reuse existing Fusion widget and/or backend code:
   * Buffer
   * Query
   * Theme
   * FeatureInfo
   * Redline
   * QuickPlot
   * Search Commands
   * As a result, many Fusion viewer APIs have been polyfilled to support these tools
 * Components docked into the Task Pane will now properly scroll overflow content if required
 * [#145](https://github.com/jumpinjackie/mapguide-react-layout/issues/145): Added support for some Fusion events
 * [#197](https://github.com/jumpinjackie/mapguide-react-layout/issues/197): The `ajax-viewer` and `sidebar` templates now work with Application Definitions
 * [#17](https://github.com/jumpinjackie/mapguide-react-layout/issues/17): InvokeURL and Search commands now support:
   * Frame targeting (Target = `SpecifiedFrame`)
   * Opening in a new window (will use a modal dialog)
 * Fusion template tweaks:
   * `limegold` and `turquoiseyellow` templates now use the blueprintjs `Tabs2` component instead of the deprecated `Tabs` component
   * All templates now listen on a new dedicated redux state branch for controlling visibility/focus of primary elements:
     * Task Pane
     * Legend
     * Selection
   * New script commands are registered by default that can push new visibility/focus states to this redux state brach. As a result, any existing InvokeScript widgets that toggled the TaskPane/Legend/SelectionPanel (these commands exist if you created a fresh Application Definition in Maestro), now work out of the box and no longer show `[X] Error` placeholders
   * As a result of the new redux state branch, any InvokeURL command executed now automatically toggles the visibility/focus of the Task Pane to be the active element (if hidden or not visible).
 * [#174](https://github.com/jumpinjackie/mapguide-react-layout/issues/174): Fix race condition where the viewer finishes init before the fetching custom projections from [epsg.io](https://epsg.io/) has completed
 * [#130](https://github.com/jumpinjackie/mapguide-react-layout/issues/130): Fix `parent.parent` pointing to nowhere when viewer itself is embedded in an iframe.

0.8
===

[Changelog](https://github.com/jumpinjackie/mapguide-react-layout/compare/v0.7.1...v0.8)

 * Update Blueprint to 1.9.0
 * Update React to 15.4.2
 * Improved performance due to restructured and optimized redux state tree and updates to minimize unnecessary re-rendering
 * [#108](https://github.com/jumpinjackie/mapguide-react-layout/issues/108): Added multi-map support
    * [#64](https://github.com/jumpinjackie/mapguide-react-layout/issues/64): Ported across MapMenu fusion widget
 * [#113](https://github.com/jumpinjackie/mapguide-react-layout/issues/113): Fix small sliver of task pane content visible when task pane collapsed on sidebar template
 * [#114](https://github.com/jumpinjackie/mapguide-react-layout/issues/114): Fix legend infinite loop on maps with multiple (>2) levels of group nesting
 * [#115](https://github.com/jumpinjackie/mapguide-react-layout/issues/115): Hover styles no longer rendered for disabled toolbar items
 * [#122](https://github.com/jumpinjackie/mapguide-react-layout/issues/122): Clicking expanded panel in accordion should not collapse it
 * [#123](https://github.com/jumpinjackie/mapguide-react-layout/issues/123): Offset modals more from the top (so toolbars don't obscure them)
 * [#25](https://github.com/jumpinjackie/mapguide-react-layout/issues/25): Add support for InvokeURL command parameters
 * [#3](https://github.com/jumpinjackie/mapguide-react-layout/issues/3): Complete menu/toolbar loose ends

0.7.1
=====

[Changelog](https://github.com/jumpinjackie/mapguide-react-layout/compare/v0.7...v0.7.1)

 * [#64](https://github.com/jumpinjackie/mapguide-react-layout/issues/64): Fix accordion not showing last panel as initially expanded in Slate and Maroon templates
 * [#111](https://github.com/jumpinjackie/mapguide-react-layout/issues/111): Fix switching to fractional finite display scale not reflecting in scale dropdown
 * [#109](https://github.com/jumpinjackie/mapguide-react-layout/issues/109): Restore 'NONE' option in Base Layer Switcher component

0.7
===

[Changelog](https://github.com/jumpinjackie/mapguide-react-layout/compare/v0.6.2...v0.7)

 * [#98](https://github.com/jumpinjackie/mapguide-react-layout/issues/98): Updated to TypeScript 2.1
 * [#91](https://github.com/jumpinjackie/mapguide-react-layout/issues/91): Use [Blueprint](http://blueprintjs.com/) as UI foundation
   * Many UI elements updated/replaced/re-styled with blueprint equivalents
   * Menus (flyout and context) can now support multiple levels of nesting
   * Replaces the following components/libraries which have been removed
     * ol3-contextmenu
     * react-flyout
     * Our custom fontello icon set
 * Feature Tooltips are now toggle-able from Viewer Options
 * [#64](https://github.com/jumpinjackie/mapguide-react-layout/issues/64): All Fusion templates ported across
   * TurquoiseYellow
   * LimeGold
   * Slate
   * Maroon
 * Aqua template changes:
   * Added status bar
   * Changed to use Blueprint-styled modal dialogs
   * Task Pane window opens (if hidden) when an InvokeURL command is executed
 * Sidebar template changes:
   * Updated to use Blueprint icons and load spinner
 * More Fusion widgets ported over
   * [#96](https://github.com/jumpinjackie/mapguide-react-layout/issues/96): Geolocation
   * [#95](https://github.com/jumpinjackie/mapguide-react-layout/issues/95): Base map switcher
 * Now shows busy indicator on viewer startup instead of a "white screen of nothingness"
 * [#90](https://github.com/jumpinjackie/mapguide-react-layout/issues/90): Replaced `npm` with `yarn`
 * [#103](https://github.com/jumpinjackie/mapguide-react-layout/issues/103): non-`en` string bundles are now loaded on demand if the passed in `locale` parameter is not `en`
 * [#38](https://github.com/jumpinjackie/mapguide-react-layout/issues/38): Mouse cursor now updates based on active map tool
 * [#86](https://github.com/jumpinjackie/mapguide-react-layout/issues/86): Zoom slider position should now better reflect actual zoom (especially for tiled maps)
 * [#85](https://github.com/jumpinjackie/mapguide-react-layout/issues/85): Scale display is now editable. For tiled maps, this becomes a select dropdown of finite scales

0.6.2
=====

[Changelog](https://github.com/jumpinjackie/mapguide-react-layout/compare/v0.6.1...v0.6.2)

 * [#79](https://github.com/jumpinjackie/mapguide-react-layout/issues/79): Update OpenLayers to 3.19.1
 * [#87](https://github.com/jumpinjackie/mapguide-react-layout/issues/87): Update to TypeScript 2.0.10 and React 15.4.1
 * [#81](https://github.com/jumpinjackie/mapguide-react-layout/issues/81): Check that the `resource` parameter is specified
 * [#84](https://github.com/jumpinjackie/mapguide-react-layout/issues/84): Fix `DisplayInLegend` property of layers and groups not being used to determine visibility of legend items
 * [#88](https://github.com/jumpinjackie/mapguide-react-layout/issues/88): Fix property pane "spilling over" in non-Aqua templates when viewing a feature with lots of attributes
 * Better/improved tiled layer support
   * [#84](https://github.com/jumpinjackie/mapguide-react-layout/issues/84): Fix incorrect scale range visbility check for layers in legend
   * [#84](https://github.com/jumpinjackie/mapguide-react-layout/issues/84): Fix MapGuide base layer toggling not functioning properly in legend
   * [#83](https://github.com/jumpinjackie/mapguide-react-layout/issues/83): Ensure zoom actions and slider drags in Navigator (aka. Zoom slider) snap to the finite scale list for tiled maps

0.6.1
=====

[Changelog](https://github.com/jumpinjackie/mapguide-react-layout/compare/v0.6...v0.6.1)

 * [#76](https://github.com/jumpinjackie/mapguide-react-layout/issues/76): Fix init error when loading map containing raster layers

0.6
===

[Changelog](https://github.com/jumpinjackie/mapguide-react-layout/compare/v0.4...v0.6)

 * [#75](https://github.com/jumpinjackie/mapguide-react-layout/issues/75): Refactored flyout menus to be physically de-coupled from their toolbars
    * [#52](https://github.com/jumpinjackie/mapguide-react-layout/issues/52): Task Pane flyout menu will now properly show over the task pane when it has embedded (ActiveX/Flash/etc) content in IE.
 * [#74](https://github.com/jumpinjackie/mapguide-react-layout/issues/74): Implemented ExecuteMapAction AJAX Viewer API.
 * [#47](https://github.com/jumpinjackie/mapguide-react-layout/issues/47): Viewer now supports passing in Application Definition resource ids
    * See [KNOWN_ISSUES.md](https://github.com/jumpinjackie/mapguide-react-layout/blob/master/KNOWN_ISSUES.md) for features not yet supported
 * [#64](https://github.com/jumpinjackie/mapguide-react-layout/issues/64): New layout template: Aqua
    * This is a port of the equivalent Fusion template
 * [#33](https://github.com/jumpinjackie/mapguide-react-layout/issues/33): Update toolbar CSS in Sidebar layout template so that it better blends in.
 * [#65](https://github.com/jumpinjackie/mapguide-react-layout/issues/65): Page document title will now be set to the title of the Web Layout / Application Definition if specified
 * [#60](https://github.com/jumpinjackie/mapguide-react-layout/issues/60): Fix bad relative path to webconfig.ini that causes most server-side tools to fail
 * [#55](https://github.com/jumpinjackie/mapguide-react-layout/issues/55): Handle and show startup errors
 * [#40](https://github.com/jumpinjackie/mapguide-react-layout/issues/40): Measure tool now requires explicit start/stop of measurements
 * [#66](https://github.com/jumpinjackie/mapguide-react-layout/issues/66): Error placeholders now shown for toolbar/menu items for invalid command references
 * [#59](https://github.com/jumpinjackie/mapguide-react-layout/issues/59): Enable feature tooltips by default
 * [#73](https://github.com/jumpinjackie/mapguide-react-layout/issues/73): Fix incorrect ratio for ol.source.ImageMapGuide resulting in image requests that are bigger than viewport
 * [#71](https://github.com/jumpinjackie/mapguide-react-layout/issues/71), [#72](https://github.com/jumpinjackie/mapguide-react-layout/issues/72), [#29](https://github.com/jumpinjackie/mapguide-react-layout/issues/29): Set active tool to nothing before digitizing, ensuring selection isn't triggered when drawing
 * Selection Panel now respects attribute display order of Layer Definition
 * [#70](https://github.com/jumpinjackie/mapguide-react-layout/issues/70): Projections for unknown EPSG codes will now be requested from https://epsg.io
 * Added OL controls to base map viewer component
    * Overview Map
    * [#62](https://github.com/jumpinjackie/mapguide-react-layout/issues/62) Rotation reset
 * [#53](https://github.com/jumpinjackie/mapguide-react-layout/issues/53) Code base migrated to TypeScript 2.0
    * [#54](https://github.com/jumpinjackie/mapguide-react-layout/issues/54) Null-safety compiler options enabled
    * [#56](https://github.com/jumpinjackie/mapguide-react-layout/issues/56) `noImplicitAny` compiler option enabled

0.4
===

Initial release