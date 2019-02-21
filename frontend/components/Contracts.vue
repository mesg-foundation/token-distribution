<template>
  <vth-status @change="$emit('change')">
    <template slot-scope="instance">
      <vth-contract :address="token.address" :abi="token.abi">
        <template slot-scope="MESGToken">
          <vth-contract :address="distribution.address" :abi="distribution.abi">
            <template slot-scope="Distribution">
              <slot
                :mesgToken="MESGToken"
                :mesgAddress="token.address"
                :distributionToken="Distribution"
                :distributionAddress="distribution.address"
                :instance="instance" />
            </template>
          </vth-contract>
        </template>
      </vth-contract>
    </template>
  </vth-status>
</template>

<script>
export default {
  data() {
    return {
      token: {
        abi: require('~/assets/abi/token.json'),
        address: '0x420167d87d35c3a249b32ef6225872fbd9ab85d2'
      },
      distribution: {
        abi: require('~/assets/abi/distribution.json'),
        address: '0x1c86379124e27d61d3291bf865a9b1dc8b385484'
      }
    }
  }
}
</script>
