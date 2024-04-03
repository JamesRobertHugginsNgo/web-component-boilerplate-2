fetch(import.meta.resolve('./template.html')).then((response) => {
	return response.text().then((template) => {
		document.body.insertAdjacentHTML(
			'beforeend',
			template.replace(/(href|src)="(?!http:)(?!https:)(?!\/\/)(.*?)"/g, (match, attr, url) => {
				return `${attr}="${new URL(url, response.url).href}"`;
			})
		);
		template = document.body.lastElementChild;

		customElements.define('test-component', class extends HTMLElement {
			static observedAttributes = ['greeting'];

			#greetingElement;

			constructor() {
				super();

				console.log('CONSTRUCTOR');

				this.attachShadow({ mode: 'open' });
				this.shadowRoot.appendChild(template.content.cloneNode(true));

				this.#greetingElement = this.shadowRoot.getElementById('greeting');
			}

			connectedCallback() {
				console.group('CONNECTED CALLBACK');
				console.log('Custom element added to page.');
				console.groupEnd();
			}

			disconnectedCallback() {
				console.group('DISCONNECTED CALLBACK');
				console.log('Custom element removed from page.');
				console.groupEnd();
			}

			adoptedCallback() {
				console.group('ADOPTED CALLBACK');
				console.log('Custom element moved to new page.');
				console.groupEnd();
			}

			attributeChangedCallback(name, oldValue, newValue) {
				console.group('ATTRIBUTE CHANGED CALLBACK');
				console.log('NAME', name);
				console.log('OLD VALUE', oldValue);
				console.log('NEW VALUE', newValue);
				console.groupEnd();

				switch (name) {
					case 'greeting':
						if (!newValue) {
							this.#greetingElement.textContent = 'Hello';
						} else {
							this.#greetingElement.textContent = newValue;
						}
						break;
				}
			}
		});
	});
});
