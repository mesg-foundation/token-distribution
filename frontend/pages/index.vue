<template>
  <v-layout column justify-center align-center>
    <v-flex xs12 sm8 md6>
      <contracts>
        <template slot-scope="contracts">
          <v-card v-if="contracts.instance.enabled">
            <v-card-title class="headline">
              MESG Token Distribution
            </v-card-title>
            <v-divider />

            <v-card-text v-if="!canSend">
              From: {{contracts.instance.account}}
              <v-textarea v-model="textAddresses" labels="Distribution" hint="Format: address,amount" />
              <v-btn color="primary" @click="prepare(contracts)">
                Prepare
              </v-btn>
            </v-card-text>

            <v-card-text v-else>
              <ul>
                <li>Total addresses: {{ addresses.length }}</li>
                <li>Total token to send: {{ total }}</li>
                <li>Approval: {{ allowance }}</li>
              </ul>
              <v-btn color="primary" v-if="needApprove" @click="approve(contracts)">
                <!-- v-if="needApprove" -->
                Approve
              </v-btn>
              <v-btn color="primary" @click="send(contracts)">
                <!-- v-else -->
                Submit
              </v-btn>
            </v-card-text>

            <v-card-text v-if="tx">
              <vth-tx :tx="tx">
                <template slot-scope="tx">
                  <a :href="`https://etherscan.io/tx/${tx.tx.hash || tx.tx.transactionHash}`">View Tx {{ tx.tx.hash || tx.tx.transactionHash }}</a>
                  <pre style="overflow: scroll">{{ tx }}</pre>
                </template>
              </vth-tx>
            </v-card-text>

          </v-card>
        </template>
      </contracts>
    </v-flex>
  </v-layout>
</template>

<script>
import BN from 'bignumber.js'
import Contracts from '~/components/Contracts'
BN.config({ EXPONENTIAL_AT: 100 })
export default {
  components: {
    Contracts
  },
  data() {
    return {
      textAddresses: '',
      allowance: 0,
      canSend: false,
      tx: null
    }
  },
  computed: {
    addresses() {
      return this.textAddresses.split('\n').map(x => x.split('\t')[0])
    },
    values() {
      return this.textAddresses.split('\n').map(x => BN(x.split('\t')[1]).multipliedBy(1e18))
    },
    total() {
      return this.values.reduce((prev, x) => prev.plus(x), BN(0))
    },
    needApprove() {
      return this.allowance.isLessThan(this.total)
    }
  },
  methods: {
    async prepare(contracts) {
      this.allowance = BN(await contracts.mesgToken.allowance(contracts.instance.account, contracts.distributionAddress))
      this.canSend = true
    },
    async approve(contracts) {
      this.tx = await contracts.mesgToken.approve(contracts.distributionAddress, this.total.toString())
      await this.prepare(contracts)
    },
    async send(contracts) {
      this.tx = await contracts.distributionToken.distribute(this.addresses, this.values.map(x => x.toString()))
    }
  }
}
</script>
