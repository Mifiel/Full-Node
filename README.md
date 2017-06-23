# ColoredCoins Full-Node

[![npm version](https://badge.fury.io/js/coloredcoins-full-node.svg)](http://badge.fury.io/js/coloredcoins-full-node)
[![Slack channel](http://slack.coloredcoins.org/badge.svg)](http://slack.coloredcoins.org)

* This module, coupled with [litecoin-core](https://litecoin.org) reference client, will add the colored layer to litecoin transactions and their inputs \ outputs.
* It will expose the same api as the reference client with an addition of `assets` array on each transaction input \ output.
* It will enable a user to setup an easy to deploy colored coins full node with relatively short parsing time with low disk \ memory space.
* It will replace the heavy [Colored Coins Block Explorer](https://github.com/Colored-Coins/Colored-Coins-Block-Explorer) for most use-cases.

### Dependencies:
* [litecoin-core](https://litecoin.org).
* [redis](https://redis.io).
