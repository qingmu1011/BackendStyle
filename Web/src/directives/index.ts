const directives = import.meta.glob('./modules/*.ts', { eager: true });
const myPlugin = {
    install: function (app: any) {
        for (const directive of Object.values(directives)) {
            const { name } = directive.default;
            if (name) app.directive(name, directive.default);
        }
    },
};

export default myPlugin;
