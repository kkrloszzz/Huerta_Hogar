import { configure } from '@testing-library/react';
import '@testing-library/jest-dom';

configure({
    testIdAttribute: 'data-testid',
});

const localStorageMock = {
    gettItem: jest.fn(),
    setItem: jest.fn(),
    remoeItem: jest.fn(),
    clear: jest.fn(),
};
global.localStorage = localStorageMock;

Object.defineProperties(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mocjImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    })),
});