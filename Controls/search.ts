/**
 * Search library
 * @library Controls/search
 * @includes InputContainer Controls/_search/Input/Container
 * @includes Misspell Controls/_search/Misspell
 * @includes MisspellContainer Controls/_search/Misspell/Container
 * @includes Controller Controls/_search/Controller
 * @includes Input Controls/_search/Input/Search
 * @includes _Search Controls/_search/_Search
 * @includes _SearchController Controls/_search/_SearchController
 * @public
 * @author Kraynov D.
 */

import InputContainer = require('Controls/_search/Input/Container');
import Misspell = require('Controls/_search/Misspell');
import MisspellContainer = require('Controls/_search/Misspell/Container');
import Controller = require('Controls/_search/Controller');
import Input = require('Controls/_search/Input/Search');

import getSwitcherStrFromData = require('Controls/_search/Misspell/getSwitcherStrFromData');

export {default as _Search} from './_search/_Search';

export {
   InputContainer,
   Misspell,
   MisspellContainer,
   Controller,
   Input,

   getSwitcherStrFromData
}
