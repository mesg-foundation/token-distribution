<template>
  <v-layout justify-center align-center>
    <v-flex xs12 sm6>
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
              <table style="width: 100%">
                <tr>
                  <td>Total addresses</td>
                  <td style="text-align: right">{{ addresses.length }}</td>
                </tr>
                <tr>
                  <td>Total token to send</td>
                  <td style="text-align: right">{{ total }}</td>
                </tr>
                <tr>
                  <td>Allowance</td>
                  <td style="text-align: right">{{ allowance }}</td>
                </tr>
              </table>
              <v-btn @click="back()">
                back
              </v-btn>
              <v-btn @click="prepare(contracts)">
                Refresh
              </v-btn>
              <v-btn color="primary" :loading="approving" :disabled="approving || !needApprove" @click="approve(contracts)">
                Approve
              </v-btn>
              <v-btn color="primary" :loading="distributing" :disabled="distributing || needApprove" @click="distribute(contracts)">
                Distribute
              </v-btn>
            </v-card-text>

            <v-card-text v-if="txApprove">
              <vth-tx :tx="txApprove">
                <template slot-scope="txApprove">
                   <v-icon color="success" v-if="!txApprove.pending">done</v-icon>
                  <a :href="`https://etherscan.io/tx/${txApprove.tx.hash || txApprove.tx.transactionHash}`">View approve transaction on Etherscan</a>
                  <!-- <pre style="overflow: scroll">{{ tx }}</pre> -->
                  <v-progress-linear :indeterminate="true" v-if="txApprove.pending"></v-progress-linear>
                </template>
              </vth-tx>
            </v-card-text>

            <v-card-text v-if="txDistribute">
              <vth-tx :tx="txDistribute">
                <template slot-scope="txDistribute">
                   <v-icon color="success" v-if="!txDistribute.pending">done</v-icon>
                  <a :href="`https://etherscan.io/tx/${txDistribute.tx.hash || txDistribute.tx.transactionHash}`">View distribute transaction on Etherscan</a>
                  <!-- <pre style="overflow: scroll">{{ tx }}</pre> -->
                  <v-progress-linear :indeterminate="true" v-if="txDistribute.pending"></v-progress-linear>
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
      txApprove: null,
      txDistribute: null,
      approving: false,
      distributing: false
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
    back() {
      this.canSend = false
      this.approving = false
      this.distributing = false
      this.allowance = 0
      this.tx = null
    },
    async prepare(contracts) {
      this.allowance = BN(await contracts.mesgToken.allowance(contracts.instance.account, contracts.distributionAddress))
      this.canSend = true
    },
    async approve(contracts) {
      this.approving = true
      this.txApprove = await contracts.mesgToken.approve(contracts.distributionAddress, this.total.toString())
      this.approving = false
      await this.prepare(contracts)
    },
    async distribute(contracts) {
      this.distributing = true
      this.txDistribute = await contracts.distributionToken.distribute(this.addresses, this.values.map(x => x.toString()))
      this.distributing = false
    }
  }
}
</script>
