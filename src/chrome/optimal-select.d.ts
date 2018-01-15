declare module 'optimal-select' {
    export function getMultiSelector(elements: any, ...args: any[]): any;

    export function getSingleSelector(element: any, ...args: any[]): any;

    export function optimize(selector: any, elements: any, ...args: any[]): any;

    export function select(input: any, ...args: any[]): any;

    export namespace common {
        function getCommonAncestor(elements: any, ...args: any[]): any;

        function getCommonProperties(elements: any): any;

        namespace getCommonAncestor {
            const prototype: {
            };

        }

        namespace getCommonProperties {
            const prototype: {
            };

        }

    }

    export namespace getMultiSelector {
        const prototype: {
        };

    }

    export namespace getSingleSelector {
        const prototype: {
        };

    }

    export namespace optimize {
        const prototype: {
        };

    }

    export namespace select {
        const prototype: {
        };

    }
}


