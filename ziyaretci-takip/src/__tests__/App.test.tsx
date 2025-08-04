import React from "react";
import {createRoot} from "react-dom/client";
import * as TestUtils from 'react-addons-test-utils';

import {expect} from 'chai';
import * as mocha from 'mocha';

import App from '../App';

describe('Calculator', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div');
    const root = createRoot(div);
    root.render(<App/>);
  })
});