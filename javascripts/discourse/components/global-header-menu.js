import Component from "@glimmer/component";
import { tracked } from "@glimmer/tracking";
import { action } from "@ember/object";
import { service } from "@ember/service";
import discourseDebounce from "discourse-common/lib/debounce";

export default class GlobalHeaderMenu extends Component {
  @service siteSettings;
  @tracked hamburgerMenuOpen;
  @tracked hamburgerOpenSubmenu;
  @tracked hamburgerMenu;

  get canSignUp() {
    return (
      !this.siteSettings.invite_only &&
      this.siteSettings.allow_new_registrations &&
      !this.siteSettings.enable_discourse_connect
    );
  }

  get filteredSetting() {
    let parsedSetting = JSON.parse(settings.header_links);
    let filteredSetting = [];

    parsedSetting.forEach((group) => {
      if (Object.keys(group).length) {
        filteredSetting.push(group);
      }
    });

    return filteredSetting;
  }

  clickOutside(event) {
    const isClickWithinSidebar = event.composedPath().some((element) => {
      return element?.className === "custom-global-header-nav__list--parent";
    });

    if (!isClickWithinSidebar) {
      this.hamburgerOpenSubmenu = null;
      document.removeEventListener("click", this.clickOutside);
    }
  }

  checkSize(resizeObserverEntry) {
    let totalWidth = 0;
    let corePadding = 20;

    // checking if children overflow parent
    for (let item of resizeObserverEntry.target.children) {
      item.style.display = "flex"; // temporarily display to get the width
      totalWidth += item.offsetWidth;
      item.style.display = ""; // fallback to stylesheet display
    }

    if (totalWidth + corePadding >= resizeObserverEntry.target.offsetWidth) {
      this.hamburgerMenu = true;
    } else {
      this.hamburgerMenu = false;
    }
  }

  @action
  menuResized(resizeObserverEntry) {
    // avoid flickering on resize
    discourseDebounce(this, this.checkSize, resizeObserverEntry, 250);
  }

  @action
  getHeight() {
    // getting header height for sticky top position
    this.headerHeight = document.querySelector(
      ".global-header-menu-connector"
    ).offsetHeight;

    document.documentElement.style.setProperty(
      "--custom-global-header-height",
      this.headerHeight + "px"
    );
  }

  @action
  showSubmenu(name) {
    if (name === null) {
      // close menu on child link click
      this.hamburgerMenuOpen = null;
      document.removeEventListener("click", this.clickOutside);
    }

    if (this.hamburgerOpenSubmenu === name) {
      // close menu on self click
      this.hamburgerOpenSubmenu = null;
    } else {
      this.hamburgerOpenSubmenu = name;
    }
  }

  @action
  toggleMenu() {
    this.hamburgerOpenSubmenu = null;
    return (this.hamburgerMenuOpen = !this.hamburgerMenuOpen);
  }
}
