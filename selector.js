function _$(selector) {
    const elements = typeof selector === 'string'
        ? document.querySelectorAll(selector)
        : [selector];

    return {
        elements,

        // 첫 번째 요소 반환
        get first() {
            return this.elements[0];
        },

        each(callback) {
            this.elements.forEach((el, idx) => callback.call(el, el, idx));
            return this;
        },

        addClass(className) {
            this.each(el => el.classList.add(className));
            return this;
        },

        removeClass(className) {
            this.each(el => el.classList.remove(className));
            return this;
        },

        on(event, handler) {
            this.each(el => el.addEventListener(event, handler));
            return this;
        },

        css(prop, value) {
            this.each(el => el.style[prop] = value);
            return this;
        },

        text(value) {
            if (value === undefined) {
                return this.first ? this.first.textContent : '';
            }
            this.each(el => el.textContent = value);
            return this;
        },

        html(value) {
            if (value === undefined) {
                return this.first ? this.first.innerHTML : '';
            }
            this.each(el => el.innerHTML = value);
            return this;
        },

        val(value) {
            if (value === undefined) {
                return this.first ? this.first.value : '';
            }
            this.each(el => el.value = value);
            return this;
        }
    };
}