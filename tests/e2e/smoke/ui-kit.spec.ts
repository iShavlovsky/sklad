import { expect, test } from '../fixtures';
import {
  MOBILE_360X800_PROJECT_NAME,
  MOBILE_360X800_VIEWPORT,
} from '../support/mobile-360x800';

test.describe('ui-kit foundations', () => {
  test('renders sections A, B, C, D1, D2, D3, D4, F, and G across reference viewports', async ({
    page,
  }, testInfo) => {
    test.setTimeout(60000);
    await page.setViewportSize(
      testInfo.project.name === MOBILE_360X800_PROJECT_NAME
        ? MOBILE_360X800_VIEWPORT
        : { width: 1440, height: 1024 }
    );
    await page.goto('/#/ui-kit');
    await page.waitForLoadState('networkidle');

    const geometry = await page.evaluate(() => {
      const headerRail = document.querySelector(
        '.mobile-shell__header .mobile-shell__rail'
      );
      const mainPanel = document.querySelector('.mobile-shell__main-panel');
      const mobilePageContainer = document.querySelector(
        '.mobile-page-container'
      );
      const fullPageContainer = document.querySelector('.full-page-container');
      const sectionA = document.querySelector(
        '[data-testid="ui-kit-section-a"]'
      );
      const sectionB = document.querySelector(
        '[data-testid="ui-kit-section-b"]'
      );
      const sectionC = document.querySelector(
        '[data-testid="ui-kit-section-c"]'
      );
      const sectionD1 = document.querySelector(
        '[data-testid="ui-kit-section-d1"]'
      );
      const sectionD2 = document.querySelector(
        '[data-testid="ui-kit-section-d2"]'
      );
      const sectionD3 = document.querySelector(
        '[data-testid="ui-kit-section-d3"]'
      );
      const sectionD4 = document.querySelector(
        '[data-testid="ui-kit-section-d4"]'
      );
      const sectionF = document.querySelector(
        '[data-testid="ui-kit-section-f"]'
      );
      const sectionG = document.querySelector(
        '[data-testid="ui-kit-section-g"]'
      );
      const rect = (node: Element | null) => node?.getBoundingClientRect();

      return {
        fullPageContainerExists: Boolean(fullPageContainer),
        mobilePageContainerExists: Boolean(mobilePageContainer),
        fullPageWidth: rect(fullPageContainer)?.width ?? 0,
        headerRailWidth: rect(headerRail)?.width ?? 0,
        mainPanelWidth: rect(mainPanel)?.width ?? 0,
        sectionAWidth: rect(sectionA)?.width ?? 0,
        sectionBWidth: rect(sectionB)?.width ?? 0,
        sectionCWidth: rect(sectionC)?.width ?? 0,
        sectionD1Width: rect(sectionD1)?.width ?? 0,
        sectionD2Width: rect(sectionD2)?.width ?? 0,
        sectionD3Width: rect(sectionD3)?.width ?? 0,
        sectionD4Width: rect(sectionD4)?.width ?? 0,
        sectionFWidth: rect(sectionF)?.width ?? 0,
        sectionGWidth: rect(sectionG)?.width ?? 0,
        viewportWidth: window.innerWidth,
      };
    });

    const tokenSamples = await page.evaluate(() => {
      const spacing = document.querySelector<HTMLElement>(
        '[data-spacing-value="16px"]'
      );
      const radius = document.querySelector<HTMLElement>(
        '[data-radius-value="12px"]'
      );
      const shadow = document.querySelector<HTMLElement>(
        '[data-shadow-value="md"]'
      );
      const focus = document.querySelector<HTMLElement>(
        '[data-focus-ring-sample="true"]'
      );
      const surface = document.querySelector<HTMLElement>(
        '[data-surface-value="Raised"]'
      );

      return {
        spacingWidth: spacing?.getBoundingClientRect().width ?? 0,
        spacingHeight: spacing?.getBoundingClientRect().height ?? 0,
        radiusValue: radius ? getComputedStyle(radius).borderRadius : '',
        shadowValue: shadow ? getComputedStyle(shadow).boxShadow : '',
        focusOutlineWidth: focus ? getComputedStyle(focus).outlineWidth : '',
        focusOutlineOffset: focus ? getComputedStyle(focus).outlineOffset : '',
        surfaceBackground: surface
          ? getComputedStyle(surface).backgroundColor
          : '',
      };
    });

    const mainButton = page.getByRole('button', { name: 'Основное действие' });
    const xxxsButton = page.getByRole('button', { name: 'XXXS', exact: true });
    const xxsButton = page.getByRole('button', { name: 'XXS', exact: true });
    const xsButton = page.getByRole('button', { name: 'XS', exact: true });
    const lgButton = page.getByRole('button', { name: 'LG', exact: true });
    const greenButton = page.getByRole('button', { name: 'Успех' }).first();
    const redButton = page.getByRole('button', { name: 'Ошибка' }).first();
    const mainActionIcon = page.getByLabel('Decrease');
    const xxxsActionIcon = page.getByLabel('Размер xxxs');
    const xxsActionIcon = page.getByLabel('Размер xxs');
    const xsActionIcon = page.getByLabel('Размер xs');
    const xlActionIcon = page.getByLabel('Размер xl');
    const greenActionIcon = page.getByLabel('Успех');
    const redActionIcon = page.getByLabel('Ошибка');
    const textInput = page.getByLabel('Текстовое поле', { exact: true });
    const xxxsInput = page.getByLabel('XXXS', { exact: true });
    const xxsInput = page.getByLabel('XXS', { exact: true });
    const xsInput = page.getByLabel('XS', { exact: true });
    const lgInput = page.getByLabel('LG', { exact: true });
    const textarea = page.getByLabel('Комментарий');
    const searchInput = page.getByPlaceholder(
      'Поиск по значению, поставщику или категории'
    );
    const transitionButton = page
      .getByTestId('ui-kit-section-d1')
      .getByRole('button', { name: 'Secondary', exact: true });
    const transitionInput = page.getByLabel('Код склада');
    const successInput = page.getByTestId('d1-success-input');
    const warningInput = page.getByTestId('d1-warning-input');
    const themeToggle = page.getByTestId('ui-kit-theme-toggle');
    const d2Select = page.getByTestId('d2-select');
    const d2NativeSelect = page.getByTestId('d2-native-select');
    const d2Checkbox = page.getByTestId('d2-checkbox');
    const d2Switch = page.getByTestId('d2-switch');
    const d2TagsInputShell = page.getByTestId('d2-tags-input-shell');
    const d2DatePicker = page.getByTestId('d2-date-picker');
    const d2DateTime = page.getByTestId('d2-datetime-picker');
    const d2TimeInput = page.getByTestId('d2-time-input');
    const d3Paper = page.getByTestId('d3-paper-sample');
    const d3Card = page.getByTestId('d3-card-sample');
    const d3Fieldset = page.getByTestId('d3-fieldset');
    const d3Accordion = page.getByTestId('d3-accordion');
    const d3MenuTarget = page.getByTestId('d3-menu-target');
    const d3MenuDropdown = page.getByTestId('d3-menu-dropdown');
    const d3OverlayState = page.getByTestId('d3-overlay-state');
    const d3PopoverTarget = page.getByTestId('d3-popover-target');
    const d3PopoverDropdown = page.getByTestId('d3-popover-dropdown');
    const d3PopoverTargetWide = page.getByTestId('d3-popover-target-wide');
    const d3PopoverDropdownWide = page.getByTestId('d3-popover-dropdown-wide');
    const d3ModalTarget = page.getByTestId('d3-modal-target');
    const d3ModalTargetXl = page.getByTestId('d3-modal-target-xl');
    const d3ModalDialog = page.getByRole('dialog', { name: 'Preview modal' });
    const d3ModalDialogXl = page.getByRole('dialog', {
      name: 'Large preview modal',
    });
    const d3DrawerTargetXs = page.getByTestId('d3-drawer-target-xs');
    const d3DrawerTargetMd = page.getByTestId('d3-drawer-target-md');
    const d3DrawerDialogXs = page.getByRole('dialog', {
      name: 'Compact drawer',
    });
    const d3DrawerDialogMd = page.getByRole('dialog', {
      name: 'Standard drawer',
    });
    const d3ToggleAlert = page.getByTestId('d3-toggle-alert');
    const d3FeedbackSuccess = page.getByTestId('d3-feedback-success');
    const d3FeedbackLoading = page.getByTestId('d3-feedback-loading');
    const d3AlertInfo = page.getByTestId('d3-alert-info');
    const d3AlertError = page.getByTestId('d3-alert-error');
    const d3NotificationSuccess = page.getByTestId('d3-notification-success');
    const d3NotificationLoading = page.getByTestId('d3-notification-loading');
    const d3ToggleOverlay = page.getByTestId('d3-toggle-overlay');
    const d3ToggleSkeleton = page.getByTestId('d3-toggle-skeleton');
    const d3LoaderSm = page.getByTestId('d3-loader-sm');
    const d3LoaderLg = page.getByTestId('d3-loader-lg');
    const d3LoaderXl = page.getByTestId('d3-loader-xl');
    const d3SkeletonBlock = page.getByTestId('d3-skeleton-block');
    const d3SkeletonContent = page.getByTestId('d3-skeleton-content');
    const d3LoadingOverlay = page.getByTestId('d3-loading-overlay');
    const d3LoadingOverlayState = page.getByTestId('d3-loading-overlay-state');
    const d3EmptyState = page.getByTestId('d3-empty-state');
    const d4BurgerSm = page.getByTestId('d4-burger-sm');
    const d4BurgerLg = page.getByTestId('d4-burger-lg');
    const d4BurgerPanel = page.getByTestId('d4-burger-panel');
    const d4Pagination = page.getByTestId('d4-pagination');
    const d4PaginationPrev = page.getByTestId('d4-pagination-prev');
    const d4PaginationNext = page.getByTestId('d4-pagination-next');
    const d4PaginationState = page.getByTestId('d4-pagination-state');
    const d4Stepper = page.getByTestId('d4-stepper');
    const d4StepperState = page.getByTestId('d4-stepper-state');
    const d4StepperPrev = page.getByTestId('d4-stepper-prev');
    const d4StepperNext = page.getByTestId('d4-stepper-next');
    const d4ProgressSm = page.getByTestId('d4-progress-sm');
    const d4ProgressLg = page.getByTestId('d4-progress-lg');
    const d4ProgressToggle = page.getByTestId('d4-progress-toggle');
    const d4ProgressState = page.getByTestId('d4-progress-state');
    const d4RingProgress = page.getByTestId('d4-ring-progress');
    const d4Indicator = page.getByTestId('d4-indicator');
    const d4AvatarGroup = page.getByTestId('d4-avatar-group');
    const d4Timeline = page.getByTestId('d4-timeline');
    const d4List = page.getByTestId('d4-list');
    const d4MarkText = page.getByTestId('d4-mark-text');
    const d4ToggleMark = page.getByTestId('d4-toggle-mark');
    const d4Table = page.getByTestId('d4-table');
    const d4HookHoverCard = page.getByTestId('d4-hook-hover-card');
    const d4HookFocusCard = page.getByTestId('d4-hook-focus-card');
    const d4HookFocusInput = page.getByTestId('d4-hook-focus-input');
    const d4HooksPopoverToggle = page.getByTestId('d4-hooks-popover-toggle');
    const d4HooksPopover = page.getByTestId('d4-hooks-popover');
    const d4HooksMotionToggle = page.getByTestId('d4-hooks-motion-toggle');
    const d4HooksMotionProgress = page.getByTestId('d4-hooks-motion-progress');
    const d4HooksReducedMotion = page.getByTestId('d4-hooks-reduced-motion');
    const d4BottomNavPreview = page.getByTestId('d4-bottom-nav-preview');
    const d4BottomNavContext = page.getByTestId('d4-bottom-nav-context');
    const d4BottomNavStateActive = page.getByTestId(
      'd4-bottom-nav-state-active'
    );
    const d4BottomNavStateIndicator = page.getByTestId(
      'd4-bottom-nav-state-indicator'
    );
    const d4BottomNavStatePressed = page.getByTestId(
      'd4-bottom-nav-state-pressed'
    );
    const d4BottomNavStateFocus = page.getByTestId('d4-bottom-nav-state-focus');
    const d4BottomNavStateDisabled = page.getByTestId(
      'd4-bottom-nav-state-disabled'
    );
    const sectionF = page.getByTestId('ui-kit-section-f');
    const fButtonHover = page.getByTestId('f-button-hover');
    const fButtonFocus = page.getByTestId('f-button-focus');
    const fButtonDisabled = page.getByTestId('f-button-disabled');
    const fInputSuccess = page.getByTestId('f-input-success');
    const fInputWarning = page.getByTestId('f-input-warning');
    const fInputError = page.getByTestId('f-input-error');
    const fRowHover = page.getByTestId('f-row-hover');
    const fRowSelected = page.getByTestId('f-row-selected');
    const fRowDisabled = page.getByTestId('f-row-disabled');
    const fSegmented = page.getByTestId('f-segmented');
    const fTabSelected = page.getByTestId('f-tab-selected');
    const fBadgeOffline = page.getByTestId('f-badge-offline');
    const fBadgePending = page.getByTestId('f-badge-pending');
    const fBadgeSuccess = page.getByTestId('f-badge-success');
    const fBadgeError = page.getByTestId('f-badge-error');
    const fHelpAlert = page.getByTestId('f-help-alert');
    const fValidationAlert = page.getByTestId('f-validation-alert');
    const fNotificationPending = page.getByTestId('f-notification-pending');
    const fLoaderInline = page.getByTestId('f-loader-inline');
    const fEmptyCard = page.getByTestId('f-empty-card');
    const fDarkButton = page.getByTestId('f-dark-button');
    const fDarkInput = page.getByTestId('f-dark-input');
    const fDarkRow = page.getByTestId('f-dark-row');
    const sectionG = page.getByTestId('ui-kit-section-g');
    const gActionSearch = page.getByTestId('g-action-search');
    const gActionScanner = page.getByTestId('g-action-scanner');
    const gActionSettings = page.getByTestId('g-action-settings');
    const gNav0 = page.getByTestId('g-nav-0');
    const gNav1 = page.getByTestId('g-nav-1');
    const gGridScanner = page.getByTestId('g-grid-scanner');
    const gSizeInline = page.getByTestId('g-size-inline');
    const gSizeNavigation = page.getByTestId('g-size-navigation');
    const gSizeEmphasis = page.getByTestId('g-size-emphasis');

    const componentSamples = {
      buttonHeight: await mainButton.evaluate(
        (element) => element.getBoundingClientRect().height
      ),
      buttonXxxsHeight: await xxxsButton.evaluate(
        (element) => element.getBoundingClientRect().height
      ),
      buttonXxsHeight: await xxsButton.evaluate(
        (element) => element.getBoundingClientRect().height
      ),
      buttonXsHeight: await xsButton.evaluate(
        (element) => element.getBoundingClientRect().height
      ),
      buttonLgHeight: await lgButton.evaluate(
        (element) => element.getBoundingClientRect().height
      ),
      greenButtonBackground: await greenButton.evaluate(
        (element) => getComputedStyle(element).backgroundColor
      ),
      redButtonBorder: await redButton.evaluate(
        (element) => getComputedStyle(element).borderColor
      ),
      actionIconWidth: await mainActionIcon.evaluate(
        (element) => element.getBoundingClientRect().width
      ),
      actionIconHeight: await mainActionIcon.evaluate(
        (element) => element.getBoundingClientRect().height
      ),
      actionIconXxxsWidth: await xxxsActionIcon.evaluate(
        (element) => element.getBoundingClientRect().width
      ),
      actionIconXxsWidth: await xxsActionIcon.evaluate(
        (element) => element.getBoundingClientRect().width
      ),
      actionIconXsWidth: await xsActionIcon.evaluate(
        (element) => element.getBoundingClientRect().width
      ),
      actionIconXlWidth: await xlActionIcon.evaluate(
        (element) => element.getBoundingClientRect().width
      ),
      greenActionIconBackground: await greenActionIcon.evaluate(
        (element) => getComputedStyle(element).backgroundColor
      ),
      redActionIconBorder: await redActionIcon.evaluate(
        (element) => getComputedStyle(element).borderColor
      ),
      textInputRadius: await textInput.evaluate(
        (element) => getComputedStyle(element).borderRadius
      ),
      textInputHeight: await textInput.evaluate(
        (element) => element.getBoundingClientRect().height
      ),
      textInputXxxsHeight: await xxxsInput.evaluate(
        (element) => element.getBoundingClientRect().height
      ),
      textInputXxsHeight: await xxsInput.evaluate(
        (element) => element.getBoundingClientRect().height
      ),
      textInputXsHeight: await xsInput.evaluate(
        (element) => element.getBoundingClientRect().height
      ),
      textInputLgHeight: await lgInput.evaluate(
        (element) => element.getBoundingClientRect().height
      ),
      textareaRadius: await textarea.evaluate(
        (element) => getComputedStyle(element).borderRadius
      ),
      searchInputHeight: await searchInput.evaluate(
        (element) => element.getBoundingClientRect().height
      ),
      buttonTransition: await transitionButton.evaluate(
        (element) => getComputedStyle(element).transitionProperty
      ),
      inputTransition: await transitionInput.evaluate(
        (element) => getComputedStyle(element).transitionProperty
      ),
      successInputBorder: await successInput.evaluate(
        (element) => getComputedStyle(element).borderColor
      ),
      warningInputBorder: await warningInput.evaluate(
        (element) => getComputedStyle(element).borderColor
      ),
    };

    const d2Samples = await page.evaluate(() => {
      const segmentedIndicator = document.querySelector<HTMLElement>(
        '[data-testid="d2-segmented"] .mantine-SegmentedControl-indicator'
      );
      const activeTab = document.querySelector<HTMLElement>(
        '[data-testid="d2-tab-buffer"]'
      );
      const badge = document.querySelector<HTMLElement>(
        '[data-testid="d2-badge-default"]'
      );
      const badgeXs = document.querySelector<HTMLElement>(
        '[data-testid="d2-badge-size-xs"]'
      );
      const badgeMd = document.querySelector<HTMLElement>(
        '[data-testid="d2-badge-size-md"]'
      );
      const pillXs = document.querySelector<HTMLElement>(
        '[data-testid="d2-pill-size-xs"]'
      );
      const pillMd = document.querySelector<HTMLElement>(
        '[data-testid="d2-pill-size-md"]'
      );

      return {
        segmentedIndicatorShadow: segmentedIndicator
          ? getComputedStyle(segmentedIndicator).boxShadow
          : '',
        activeTabBackground: activeTab
          ? getComputedStyle(activeTab).backgroundColor
          : '',
        badgeRadius: badge ? getComputedStyle(badge).borderRadius : '',
        activeTabBottomLeftRadius: activeTab
          ? getComputedStyle(activeTab).borderBottomLeftRadius
          : '',
        badgeXsHeight: badgeXs ? badgeXs.getBoundingClientRect().height : 0,
        badgeMdHeight: badgeMd ? badgeMd.getBoundingClientRect().height : 0,
        pillXsHeight: pillXs ? pillXs.getBoundingClientRect().height : 0,
        pillMdHeight: pillMd ? pillMd.getBoundingClientRect().height : 0,
      };
    });

    const d2LocatorSamples = {
      selectRadius: await d2Select.evaluate(
        (element) => getComputedStyle(element).borderRadius
      ),
      nativeSelectRadius: await d2NativeSelect.evaluate(
        (element) => getComputedStyle(element).borderRadius
      ),
      checkboxBorder: await d2Checkbox.evaluate(
        (element) => getComputedStyle(element).borderColor
      ),
      switchHeight: await d2Switch.evaluate(
        (element) => element.getBoundingClientRect().height
      ),
      tagsInputHeight: await d2TagsInputShell.evaluate(
        (element) => element.getBoundingClientRect().height
      ),
      datePickerHeight: await d2DatePicker.evaluate(
        (element) => element.getBoundingClientRect().height
      ),
      dateTimeHeight: await d2DateTime.evaluate(
        (element) => element.getBoundingClientRect().height
      ),
      timeInputHeight: await d2TimeInput.evaluate(
        (element) => element.getBoundingClientRect().height
      ),
    };

    const d3Samples = await page.evaluate(() => {
      const readAnimatedDescendants = (selector: string) => {
        const root = document.querySelector<HTMLElement>(selector);

        if (!root) {
          return [];
        }

        return [
          root,
          ...Array.from(root.querySelectorAll<HTMLElement>('*')),
        ].map((element) => {
          const styles = getComputedStyle(element);

          return `${styles.animationName}|${styles.animationDuration}`;
        });
      };

      const alertInfo = document.querySelector<HTMLElement>(
        '[data-testid="d3-alert-info"]'
      );
      const alertError = document.querySelector<HTMLElement>(
        '[data-testid="d3-alert-error"]'
      );
      const notificationSuccess = document.querySelector<HTMLElement>(
        '[data-testid="d3-notification-success"]'
      );
      const notificationLoading = document.querySelector<HTMLElement>(
        '[data-testid="d3-notification-loading"]'
      );

      return {
        alertInfoBackground: alertInfo
          ? getComputedStyle(alertInfo).backgroundColor
          : '',
        alertErrorBackground: alertError
          ? getComputedStyle(alertError).backgroundColor
          : '',
        notificationSuccessBackground: notificationSuccess
          ? getComputedStyle(notificationSuccess).backgroundColor
          : '',
        notificationLoadingBackground: notificationLoading
          ? getComputedStyle(notificationLoading).backgroundColor
          : '',
        loaderAnimations: readAnimatedDescendants(
          '[data-testid="d3-loader-sm"]'
        ),
        notificationLoaderAnimations: readAnimatedDescendants(
          '[data-testid="d3-notification-loading"]'
        ),
      };
    });

    const d4Samples = await page.evaluate(() => {
      const burgerSm = document.querySelector<HTMLElement>(
        '[data-testid="d4-burger-sm"]'
      );
      const burgerLg = document.querySelector<HTMLElement>(
        '[data-testid="d4-burger-lg"]'
      );
      const progressSm = document.querySelector<HTMLElement>(
        '[data-testid="d4-progress-sm"]'
      );
      const progressLg = document.querySelector<HTMLElement>(
        '[data-testid="d4-progress-lg"]'
      );
      const mark = document.querySelector<HTMLElement>(
        '[data-testid="d4-mark-text"] mark'
      );
      const paginationControl = document.querySelector<HTMLElement>(
        '[data-testid="d4-pagination"] button'
      );
      const stepIcon = document.querySelector<HTMLElement>(
        '[data-testid="d4-stepper"] .mantine-Stepper-stepIcon'
      );
      const bottomNavDock = document.querySelector<HTMLElement>(
        '[data-testid="d4-bottom-nav-preview"] .mobile-bottom-nav__dock'
      );
      const bottomNavIndicator = document.querySelector<HTMLElement>(
        '[data-testid="d4-bottom-nav-preview"] .mobile-bottom-nav__indicator'
      );
      const bottomNavActiveItem = document.querySelector<HTMLElement>(
        '[data-testid="d4-bottom-nav-preview"] [aria-current="page"]'
      );

      return {
        burgerSmWidth: burgerSm?.getBoundingClientRect().width ?? 0,
        burgerLgWidth: burgerLg?.getBoundingClientRect().width ?? 0,
        burgerTransition: burgerSm
          ? getComputedStyle(burgerSm).transitionProperty
          : '',
        paginationTransition: paginationControl
          ? getComputedStyle(paginationControl).transitionProperty
          : '',
        progressSmHeight: progressSm?.getBoundingClientRect().height ?? 0,
        progressLgHeight: progressLg?.getBoundingClientRect().height ?? 0,
        stepIconTransition: stepIcon
          ? getComputedStyle(stepIcon).transitionProperty
          : '',
        markBackground: mark ? getComputedStyle(mark).backgroundColor : '',
        bottomNavActiveCount: bottomNavActiveItem ? 1 : 0,
        bottomNavBackdropFilter: bottomNavDock
          ? getComputedStyle(bottomNavDock).backdropFilter
          : '',
        bottomNavBackground: bottomNavDock
          ? getComputedStyle(bottomNavDock).backgroundImage
          : '',
        bottomNavIndicatorHeight:
          bottomNavIndicator?.getBoundingClientRect().height ?? 0,
        bottomNavIndicatorWidth:
          bottomNavIndicator?.getBoundingClientRect().width ?? 0,
      };
    });

    const fSamples = await page.evaluate(() => {
      const readControl = (selector: string) => {
        const root = document.querySelector<HTMLElement>(selector);

        if (!root) {
          return null;
        }

        return root.matches('input, textarea')
          ? root
          : root.querySelector<HTMLElement>('input, textarea');
      };

      const selectedRow = document.querySelector<HTMLElement>(
        '[data-testid="f-row-selected"]'
      );
      const hoverRow = document.querySelector<HTMLElement>(
        '[data-testid="f-row-hover"]'
      );
      const disabledRow = document.querySelector<HTMLElement>(
        '[data-testid="f-row-disabled"]'
      );
      const segmentedIndicator = document.querySelector<HTMLElement>(
        '[data-testid="f-segmented"] .mantine-SegmentedControl-indicator'
      );
      const activeTab = document.querySelector<HTMLElement>(
        '[data-testid="f-tab-selected"]'
      );
      const badgeOffline = document.querySelector<HTMLElement>(
        '[data-testid="f-badge-offline"]'
      );
      const badgePending = document.querySelector<HTMLElement>(
        '[data-testid="f-badge-pending"]'
      );
      const badgeSuccess = document.querySelector<HTMLElement>(
        '[data-testid="f-badge-success"]'
      );
      const badgeError = document.querySelector<HTMLElement>(
        '[data-testid="f-badge-error"]'
      );
      const inputSuccess = readControl('[data-testid="f-input-success"]');
      const inputWarning = readControl('[data-testid="f-input-warning"]');
      const inputError = readControl('[data-testid="f-input-error"]');
      const buttonFocus = document.querySelector<HTMLElement>(
        '[data-testid="f-button-focus"]'
      );
      const darkRow = document.querySelector<HTMLElement>(
        '[data-testid="f-dark-row"]'
      );
      const loader = document.querySelector<HTMLElement>(
        '[data-testid="f-loader-inline"]'
      );

      return {
        selectedRowBackground: selectedRow
          ? getComputedStyle(selectedRow).backgroundColor
          : '',
        hoverRowBackground: hoverRow
          ? getComputedStyle(hoverRow).backgroundColor
          : '',
        disabledRowOpacity: disabledRow
          ? getComputedStyle(disabledRow).opacity
          : '',
        segmentedIndicatorShadow: segmentedIndicator
          ? getComputedStyle(segmentedIndicator).boxShadow
          : '',
        activeTabBackground: activeTab
          ? getComputedStyle(activeTab).backgroundColor
          : '',
        badgeOfflineBackground: badgeOffline
          ? getComputedStyle(badgeOffline).backgroundColor
          : '',
        badgePendingBackground: badgePending
          ? getComputedStyle(badgePending).backgroundColor
          : '',
        badgeSuccessBackground: badgeSuccess
          ? getComputedStyle(badgeSuccess).backgroundColor
          : '',
        badgeErrorBackground: badgeError
          ? getComputedStyle(badgeError).backgroundColor
          : '',
        inputSuccessBorder: inputSuccess
          ? getComputedStyle(inputSuccess).borderColor
          : '',
        inputWarningBorder: inputWarning
          ? getComputedStyle(inputWarning).borderColor
          : '',
        inputErrorBorder: inputError
          ? getComputedStyle(inputError).borderColor
          : '',
        inputErrorBackground: inputError
          ? getComputedStyle(inputError).backgroundColor
          : '',
        buttonFocusShadow: buttonFocus
          ? getComputedStyle(buttonFocus).boxShadow
          : '',
        darkRowBackground: darkRow
          ? getComputedStyle(darkRow).backgroundColor
          : '',
        loaderAnimations: loader
          ? [
              loader,
              ...Array.from(loader.querySelectorAll<HTMLElement>('*')),
            ].map((element) => {
              const styles = getComputedStyle(element);
              return `${styles.animationName}|${styles.animationDuration}`;
            })
          : [],
      };
    });

    const gSamples = await page.evaluate(() => {
      const readRect = (selector: string) =>
        document.querySelector<HTMLElement>(selector)?.getBoundingClientRect();

      const nav0 = document.querySelector<HTMLElement>(
        '[data-testid="g-nav-0"]'
      );
      const nav1 = document.querySelector<HTMLElement>(
        '[data-testid="g-nav-1"]'
      );
      const searchAction = document.querySelector<HTMLElement>(
        '[data-testid="g-action-search"]'
      );
      const scannerAction = document.querySelector<HTMLElement>(
        '[data-testid="g-action-scanner"]'
      );
      const settingsAction = document.querySelector<HTMLElement>(
        '[data-testid="g-action-settings"]'
      );

      return {
        sizeInlineWidth: readRect('[data-testid="g-size-inline"]')?.width ?? 0,
        sizeNavigationWidth:
          readRect('[data-testid="g-size-navigation"]')?.width ?? 0,
        sizeEmphasisWidth:
          readRect('[data-testid="g-size-emphasis"]')?.width ?? 0,
        searchActionWidth: searchAction?.getBoundingClientRect().width ?? 0,
        scannerActionWidth: scannerAction?.getBoundingClientRect().width ?? 0,
        settingsActionWidth: settingsAction?.getBoundingClientRect().width ?? 0,
        nav0Background: nav0 ? getComputedStyle(nav0).backgroundColor : '',
        nav1Background: nav1 ? getComputedStyle(nav1).backgroundColor : '',
      };
    });

    await expect(page).toHaveURL(/#\/ui-kit$/);
    await expect(page.getByRole('heading', { name: 'UI Kit' })).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Primary / Blue' })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Neutral / Slate' })
    ).toBeVisible();
    await expect(page.getByTestId('ui-kit-section-a')).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'B. Типографика' })
    ).toBeVisible();
    await expect(page.getByTestId('ui-kit-section-b')).toBeVisible();
    await expect(page.getByTestId('ui-kit-section-c')).toBeVisible();
    await expect(page.getByTestId('ui-kit-section-d1')).toBeVisible();
    await expect(page.getByTestId('ui-kit-section-d2')).toBeVisible();
    await expect(page.getByTestId('ui-kit-section-d3')).toBeVisible();
    await expect(page.getByTestId('ui-kit-section-d4')).toBeVisible();
    await expect(sectionF).toBeVisible();
    await expect(sectionG).toBeVisible();
    await expect(themeToggle).toBeVisible();

    expect(geometry.fullPageContainerExists).toBe(true);
    expect(geometry.mobilePageContainerExists).toBe(false);
    expect(geometry.sectionAWidth).toBeGreaterThan(0);
    expect(geometry.sectionBWidth).toBeGreaterThan(0);
    expect(geometry.sectionCWidth).toBeGreaterThan(0);
    expect(geometry.sectionD1Width).toBeGreaterThan(0);
    expect(geometry.sectionD2Width).toBeGreaterThan(0);
    expect(geometry.sectionD3Width).toBeGreaterThan(0);
    expect(geometry.sectionD4Width).toBeGreaterThan(0);
    expect(geometry.sectionFWidth).toBeGreaterThan(0);
    expect(geometry.sectionGWidth).toBeGreaterThan(0);
    expect(geometry.mainPanelWidth).toBeGreaterThanOrEqual(
      geometry.viewportWidth - 4
    );
    expect(tokenSamples.spacingWidth).toBeGreaterThanOrEqual(15.5);
    expect(tokenSamples.spacingHeight).toBeGreaterThanOrEqual(15.5);
    expect(tokenSamples.radiusValue).toBe('12px');
    expect(tokenSamples.shadowValue).not.toBe('none');
    expect(tokenSamples.focusOutlineWidth).toBe('2px');
    expect(tokenSamples.focusOutlineOffset).toBe('2px');
    expect(tokenSamples.surfaceBackground).toBeTruthy();
    expect(componentSamples.buttonHeight).toBeGreaterThanOrEqual(40);
    expect(componentSamples.buttonXxsHeight).toBeGreaterThan(
      componentSamples.buttonXxxsHeight
    );
    expect(componentSamples.buttonXsHeight).toBeGreaterThan(
      componentSamples.buttonXxsHeight
    );
    expect(componentSamples.buttonLgHeight).toBeGreaterThan(
      componentSamples.buttonXsHeight
    );
    expect(componentSamples.greenButtonBackground).toBeTruthy();
    expect(componentSamples.redButtonBorder).toBeTruthy();
    expect(componentSamples.greenButtonBackground).not.toBe(
      componentSamples.redButtonBorder
    );
    expect(componentSamples.actionIconWidth).toBeGreaterThanOrEqual(40);
    expect(componentSamples.actionIconHeight).toBeGreaterThanOrEqual(40);
    expect(componentSamples.actionIconXxsWidth).toBeGreaterThan(
      componentSamples.actionIconXxxsWidth
    );
    expect(componentSamples.actionIconXsWidth).toBeGreaterThan(
      componentSamples.actionIconXxsWidth
    );
    expect(componentSamples.actionIconXlWidth).toBeGreaterThan(
      componentSamples.actionIconXsWidth
    );
    expect(componentSamples.greenActionIconBackground).toBeTruthy();
    expect(componentSamples.redActionIconBorder).toBeTruthy();
    expect(componentSamples.textInputRadius).toBe('8px');
    expect(componentSamples.textInputHeight).toBeGreaterThanOrEqual(40);
    expect(componentSamples.textInputXxsHeight).toBeGreaterThan(
      componentSamples.textInputXxxsHeight
    );
    expect(componentSamples.textInputXsHeight).toBeGreaterThan(
      componentSamples.textInputXxsHeight
    );
    expect(componentSamples.textInputLgHeight).toBeGreaterThan(
      componentSamples.textInputXsHeight
    );
    expect(componentSamples.textareaRadius).toBe('8px');
    expect(componentSamples.searchInputHeight).toBeGreaterThanOrEqual(40);
    expect(componentSamples.buttonTransition).toContain('transform');
    expect(componentSamples.inputTransition).toContain('border-color');
    expect(componentSamples.successInputBorder).toBeTruthy();
    expect(componentSamples.warningInputBorder).toBeTruthy();
    expect(componentSamples.successInputBorder).not.toBe(
      componentSamples.warningInputBorder
    );
    expect(d2LocatorSamples.selectRadius).toBe('8px');
    expect(d2LocatorSamples.nativeSelectRadius).toBe('8px');
    expect(d2LocatorSamples.checkboxBorder).toBeTruthy();
    expect(d2LocatorSamples.switchHeight).toBeGreaterThan(0);
    expect(d2Samples.segmentedIndicatorShadow).not.toBe('none');
    expect(d2Samples.activeTabBackground).toBeTruthy();
    expect(d2Samples.activeTabBottomLeftRadius).toBe('0px');
    expect(d2Samples.badgeRadius).toBe('8px');
    expect(d2Samples.badgeMdHeight).toBeGreaterThan(d2Samples.badgeXsHeight);
    expect(d2Samples.pillMdHeight).toBeGreaterThan(d2Samples.pillXsHeight);
    expect(d2LocatorSamples.tagsInputHeight).toBeGreaterThanOrEqual(40);
    expect(d2LocatorSamples.datePickerHeight).toBeGreaterThanOrEqual(40);
    expect(d2LocatorSamples.dateTimeHeight).toBeGreaterThanOrEqual(40);
    expect(d2LocatorSamples.timeInputHeight).toBeGreaterThanOrEqual(40);

    await expect(d3Paper).toBeVisible();
    await expect(d3Card).toBeVisible();
    await expect(d3Fieldset).toBeVisible();
    await expect(d3Accordion).toBeVisible();
    await expect(d3AlertInfo).toBeVisible();
    await expect(d3AlertError).toBeVisible();
    await expect(d3NotificationSuccess).toBeVisible();
    await expect(d3NotificationLoading).toHaveCount(0);
    await expect(d3LoaderSm).toBeVisible();
    await expect(d3LoaderLg).toBeVisible();
    await expect(d3LoaderXl).toBeVisible();
    await expect(d3SkeletonBlock).toBeVisible();
    await expect(d3LoadingOverlay).toBeVisible();
    await expect(d3EmptyState).toBeVisible();

    expect(d3Samples.alertInfoBackground).toBeTruthy();
    expect(d3Samples.alertErrorBackground).toBeTruthy();
    expect(d3Samples.alertInfoBackground).not.toBe(
      d3Samples.alertErrorBackground
    );
    expect(d3Samples.notificationSuccessBackground).toBeTruthy();
    expect(
      d3Samples.loaderAnimations.some(
        (value) => !value.startsWith('none|0s') && !value.startsWith('none|0ms')
      )
    ).toBe(true);

    await d3PopoverTarget.click();
    await expect(d3PopoverDropdown).toBeVisible();

    const compactPopoverWidth = await d3PopoverDropdown.evaluate(
      (element) => element.getBoundingClientRect().width
    );

    await d3PopoverTargetWide.click();
    await expect(d3PopoverDropdownWide).toBeVisible();

    const widePopoverWidth = await d3PopoverDropdownWide.evaluate(
      (element) => element.getBoundingClientRect().width
    );

    expect(widePopoverWidth).toBeGreaterThan(compactPopoverWidth);
    await d3PopoverTargetWide.click();
    await expect(d3PopoverDropdownWide).not.toBeVisible();

    const overlayStateBefore = await d3OverlayState.textContent();
    await d3MenuTarget.click();
    await expect(d3MenuDropdown).toBeVisible();
    await d3MenuDropdown
      .getByRole('menuitem', { name: 'Edit' })
      .click({ force: true });
    await expect(d3OverlayState).not.toHaveText(overlayStateBefore ?? '');
    await expect(d3MenuDropdown).not.toBeVisible();

    await d3ModalTarget.click();
    await expect(d3ModalDialog).toBeVisible();
    const compactModalWidth = await d3ModalDialog.evaluate(
      (element) => element.getBoundingClientRect().width
    );
    await page.keyboard.press('Escape');
    await expect(d3ModalDialog).not.toBeVisible();

    await d3ModalTargetXl.click();
    await expect(d3ModalDialogXl).toBeVisible();
    const wideModalWidth = await d3ModalDialogXl.evaluate(
      (element) => element.getBoundingClientRect().width
    );
    if (geometry.viewportWidth >= 768) {
      expect(wideModalWidth).toBeGreaterThan(compactModalWidth);
    } else {
      expect(wideModalWidth).toBeGreaterThan(0);
    }
    await page.keyboard.press('Escape');
    await expect(d3ModalDialogXl).not.toBeVisible();

    await d3DrawerTargetXs.click();
    await expect(d3DrawerDialogXs).toBeVisible();
    const compactDrawerWidth = await d3DrawerDialogXs.evaluate(
      (element) => element.getBoundingClientRect().width
    );
    await page.keyboard.press('Escape');
    await expect(d3DrawerDialogXs).not.toBeVisible();

    await d3DrawerTargetMd.click();
    await expect(d3DrawerDialogMd).toBeVisible();
    const standardDrawerWidth = await d3DrawerDialogMd.evaluate(
      (element) => element.getBoundingClientRect().width
    );
    expect(standardDrawerWidth).toBeGreaterThan(compactDrawerWidth);
    await page.keyboard.press('Escape');
    await expect(d3DrawerDialogMd).not.toBeVisible();

    await d3FeedbackLoading.click();
    await expect(d3NotificationLoading).toBeVisible();
    await expect(d3NotificationSuccess).toHaveCount(0);
    const notificationLoaderAnimations = await d3NotificationLoading.evaluate(
      (root) =>
        [root, ...Array.from(root.querySelectorAll<HTMLElement>('*'))].map(
          (element) => {
            const styles = getComputedStyle(element);

            return `${styles.animationName}|${styles.animationDuration}`;
          }
        )
    );
    expect(
      notificationLoaderAnimations.some(
        (value) => !value.startsWith('none|0s') && !value.startsWith('none|0ms')
      )
    ).toBe(true);
    await d3FeedbackSuccess.click();
    await expect(d3NotificationSuccess).toBeVisible();
    await expect(d3NotificationLoading).toHaveCount(0);

    await d3ToggleAlert.click();
    await expect(d3AlertInfo).toHaveCount(0);
    await d3ToggleAlert.click();
    await expect(d3AlertInfo).toBeVisible();

    await d3ToggleSkeleton.click();
    await expect(d3SkeletonContent).toBeVisible();
    await expect(d3SkeletonBlock).toHaveCount(0);
    await d3ToggleSkeleton.click();
    await expect(d3SkeletonBlock).toBeVisible();

    await expect(d3LoadingOverlayState).toContainText('visible');
    await d3ToggleOverlay.click();
    await expect(d3LoadingOverlayState).toContainText('hidden');
    await d3ToggleOverlay.click();
    await expect(d3LoadingOverlayState).toContainText('visible');

    await expect(d4BurgerSm).toBeVisible();
    await expect(d4BurgerLg).toBeVisible();
    await expect(d4BurgerPanel).toContainText('closed');
    await expect(d4Pagination).toBeVisible();
    await expect(d4Stepper).toBeVisible();
    await expect(d4ProgressSm).toBeVisible();
    await expect(d4ProgressLg).toBeVisible();
    await expect(d4RingProgress).toBeVisible();
    await expect(d4Indicator).toBeVisible();
    await expect(d4AvatarGroup).toBeVisible();
    await expect(d4Timeline).toBeVisible();
    await expect(d4List).toBeVisible();
    await expect(d4MarkText).toBeVisible();
    await expect(d4Table).toBeVisible();
    await expect(d4HookHoverCard).toBeVisible();
    await expect(d4HookFocusCard).toBeVisible();
    await expect(d4HooksPopoverToggle).toBeVisible();
    await expect(d4HooksMotionProgress).toBeVisible();
    await expect(d4HooksReducedMotion).toBeVisible();
    await expect(d4BottomNavPreview).toBeVisible();
    await expect(d4BottomNavContext).toBeVisible();
    await expect(d4BottomNavStateActive).toBeVisible();
    await expect(d4BottomNavStateIndicator).toBeVisible();
    await expect(d4BottomNavStatePressed).toBeVisible();
    await expect(d4BottomNavStateFocus).toBeVisible();
    await expect(d4BottomNavStateDisabled).toBeVisible();

    expect(d4Samples.burgerLgWidth).toBeGreaterThan(d4Samples.burgerSmWidth);
    expect(d4Samples.burgerTransition).toContain('transform');
    expect(d4Samples.paginationTransition).toContain('transform');
    expect(d4Samples.progressLgHeight).toBeGreaterThan(
      d4Samples.progressSmHeight
    );
    expect(d4Samples.stepIconTransition).toContain('transform');
    expect(d4Samples.markBackground).toBeTruthy();
    expect(d4Samples.bottomNavBackdropFilter).toContain('blur');
    expect(d4Samples.bottomNavBackground).toContain('linear-gradient');
    expect(d4Samples.bottomNavIndicatorWidth).toBeGreaterThan(0);
    expect(d4Samples.bottomNavIndicatorHeight).toBeGreaterThan(0);
    expect(d4Samples.bottomNavActiveCount).toBe(1);

    await d4BurgerSm.click();
    await expect(d4BurgerPanel).toContainText('opened');
    await d4BurgerLg.click();
    await expect(d4BurgerPanel).toContainText('closed');

    await expect(d4PaginationState).toContainText('4');
    await d4PaginationNext.click();
    await d4PaginationNext.click();
    await expect(d4PaginationState).toContainText('6');
    await d4PaginationPrev.click();
    await expect(d4PaginationState).toContainText('5');

    await expect(d4StepperState).toContainText('2');
    await d4StepperNext.click();
    await expect(d4StepperState).toContainText('3');
    await d4StepperPrev.click();
    await expect(d4StepperState).toContainText('2');

    const initialProgressState = await d4ProgressState.textContent();
    await page.waitForTimeout(1300);
    await expect(d4ProgressState).not.toHaveText(initialProgressState ?? '');

    const initialProgressToggleLabel = await d4ProgressToggle.textContent();
    await d4ProgressToggle.click();
    await expect(d4ProgressToggle).not.toHaveText(
      initialProgressToggleLabel ?? ''
    );
    await d4ProgressToggle.click();
    await expect(d4ProgressToggle).toHaveText(initialProgressToggleLabel ?? '');

    await d4ToggleMark.scrollIntoViewIfNeeded();
    await expect(d4MarkText.locator('mark')).toHaveCount(1);
    await d4ToggleMark.click();
    await expect(d4MarkText.locator('mark')).toHaveCount(0);
    await d4ToggleMark.click();
    await expect(d4MarkText.locator('mark')).toHaveCount(1);

    if (testInfo.project.name !== MOBILE_360X800_PROJECT_NAME) {
      await d4HookHoverCard.scrollIntoViewIfNeeded();
      const hoverBackgroundBefore = await d4HookHoverCard.evaluate(
        (element) => getComputedStyle(element).backgroundColor
      );
      await d4HookHoverCard.hover();
      await expect
        .poll(async () =>
          d4HookHoverCard.evaluate(
            (element) => getComputedStyle(element).backgroundColor
          )
        )
        .not.toBe(hoverBackgroundBefore);
    }

    const focusBackgroundBefore = await d4HookFocusCard.evaluate(
      (element) => getComputedStyle(element).backgroundColor
    );
    await d4HookFocusInput.focus();
    await expect
      .poll(async () =>
        d4HookFocusCard.evaluate(
          (element) => getComputedStyle(element).backgroundColor
        )
      )
      .not.toBe(focusBackgroundBefore);

    await d4HooksPopoverToggle.click();
    await expect(d4HooksPopover).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(d4HooksPopover).not.toBeVisible();

    const initialHooksMotionToggleLabel =
      await d4HooksMotionToggle.textContent();
    await d4HooksMotionToggle.click();
    await expect(d4HooksMotionToggle).not.toHaveText(
      initialHooksMotionToggleLabel ?? ''
    );
    await d4HooksMotionToggle.click();
    await expect(d4HooksMotionToggle).toHaveText(
      initialHooksMotionToggleLabel ?? ''
    );

    await expect(fButtonHover).toBeVisible();
    await expect(fButtonFocus).toBeVisible();
    await expect(fButtonDisabled).toBeDisabled();
    await expect(fInputSuccess).toBeVisible();
    await expect(fInputWarning).toBeVisible();
    await expect(fInputError).toBeVisible();
    await expect(fRowHover).toBeVisible();
    await expect(fRowSelected).toBeVisible();
    await expect(fRowDisabled).toBeVisible();
    await expect(fSegmented).toBeVisible();
    await expect(fTabSelected).toBeVisible();
    await expect(fBadgeOffline).toBeVisible();
    await expect(fBadgePending).toBeVisible();
    await expect(fBadgeSuccess).toBeVisible();
    await expect(fBadgeError).toBeVisible();
    await expect(fHelpAlert).toBeVisible();
    await expect(fValidationAlert).toBeVisible();
    await expect(fNotificationPending).toBeVisible();
    await expect(fLoaderInline).toBeVisible();
    await expect(fEmptyCard).toBeVisible();
    await expect(fDarkButton).toBeVisible();
    await expect(fDarkInput).toBeVisible();
    await expect(fDarkRow).toBeVisible();

    expect(fSamples.selectedRowBackground).toBeTruthy();
    expect(fSamples.hoverRowBackground).toBeTruthy();
    expect(fSamples.selectedRowBackground).not.toBe(
      fSamples.hoverRowBackground
    );
    expect(Number.parseFloat(fSamples.disabledRowOpacity)).toBeLessThan(1);
    expect(fSamples.segmentedIndicatorShadow).not.toBe('none');
    expect(fSamples.activeTabBackground).toBeTruthy();
    expect(fSamples.badgeOfflineBackground).toBeTruthy();
    expect(fSamples.badgePendingBackground).toBeTruthy();
    expect(fSamples.badgeSuccessBackground).toBeTruthy();
    expect(fSamples.badgeErrorBackground).toBeTruthy();
    expect(fSamples.badgeOfflineBackground).not.toBe(
      fSamples.badgePendingBackground
    );
    expect(fSamples.badgeSuccessBackground).not.toBe(
      fSamples.badgeErrorBackground
    );
    expect(fSamples.inputSuccessBorder).toBeTruthy();
    expect(fSamples.inputWarningBorder).toBeTruthy();
    expect(fSamples.inputErrorBorder).toBeTruthy();
    expect(fSamples.inputSuccessBorder).not.toBe(fSamples.inputErrorBorder);
    expect(fSamples.inputWarningBorder).not.toBe(fSamples.inputErrorBorder);
    expect(fSamples.inputErrorBackground).toBeTruthy();
    expect(fSamples.buttonFocusShadow).not.toBe('none');
    expect(fSamples.darkRowBackground).toBeTruthy();
    expect(
      fSamples.loaderAnimations.some(
        (value) => !value.startsWith('none|0s') && !value.startsWith('none|0ms')
      )
    ).toBe(true);

    await expect(gActionSearch).toBeVisible();
    await expect(gActionScanner).toBeVisible();
    await expect(gActionSettings).toBeVisible();
    await expect(gNav0).toBeVisible();
    await expect(gNav1).toBeVisible();
    await expect(gGridScanner).toBeVisible();
    await expect(gSizeInline).toBeVisible();
    await expect(gSizeNavigation).toBeVisible();
    await expect(gSizeEmphasis).toBeVisible();

    expect(gSamples.sizeNavigationWidth).toBeGreaterThan(
      gSamples.sizeInlineWidth
    );
    expect(gSamples.sizeEmphasisWidth).toBeGreaterThan(
      gSamples.sizeNavigationWidth
    );
    expect(gSamples.scannerActionWidth).toBeGreaterThan(
      gSamples.searchActionWidth
    );
    expect(gSamples.settingsActionWidth).toBeGreaterThan(
      gSamples.searchActionWidth
    );
    expect(gSamples.nav0Background).toBeTruthy();
    expect(gSamples.nav1Background).toBeTruthy();
    expect(gSamples.nav0Background).not.toBe(gSamples.nav1Background);

    const initialThemeToggleLabel =
      await themeToggle.getAttribute('aria-label');
    await themeToggle.click();
    await expect(themeToggle).not.toHaveAttribute(
      'aria-label',
      initialThemeToggleLabel ?? ''
    );

    if (geometry.headerRailWidth < geometry.viewportWidth - 4) {
      expect(geometry.mainPanelWidth).toBeGreaterThan(geometry.headerRailWidth);
      expect(geometry.fullPageWidth).toBeGreaterThan(geometry.headerRailWidth);
    } else {
      expect(geometry.mainPanelWidth).toBeGreaterThanOrEqual(
        geometry.headerRailWidth
      );
      expect(geometry.fullPageWidth).toBeGreaterThanOrEqual(
        geometry.headerRailWidth
      );
    }
  });
});
