import Base = require('Controls/_input/Base');
import Area = require('Controls/_input/Area');
import Number = require('Controls/_input/Number');
import Text = require('Controls/_input/Text');
import Label = require('Controls/_input/Label');
import Mask = require('Controls/_input/Mask');
import Phone = require('Controls/_input/Phone');
import Password = require('Controls/_input/Password');
import DateBase = require('Controls/_input/DateTime');
import Date = require('Controls/_input/Date/Picker');

import BaseViewModel = require('Controls/_input/Base/ViewModel');
import MaskFormatBuilder = require('Controls/_input/Mask/FormatBuilder');
import MaskInputProcessor = require('Controls/_input/Mask/InputProcessor');

import lengthConstraint from 'Controls/_input/InputCallback/lengthConstraint';

const InputCallback = {
    lengthConstraint
};

export {
    Base,
    Area,
    Number,
    Text,
    Label,
    Mask,
    Phone,
    Password,
    DateBase,
    Date,
    BaseViewModel,
    MaskFormatBuilder,
    MaskInputProcessor,
    InputCallback
};
