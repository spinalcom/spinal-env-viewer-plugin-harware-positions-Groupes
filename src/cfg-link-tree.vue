<template>
  <div>
    <md-checkbox v-model="isShown_comp">{{ title }}</md-checkbox>
    <template v-if="isShown_comp">
      
      <md-field>
        <label>Contexte name</label>
        <md-input v-model="contextName_comp"></md-input>
      </md-field>

      <md-field>
        <label>Category name</label>
        <md-input v-model="catName_comp"></md-input>
      </md-field>

      <md-field>
        <label>Group name</label>
        <md-input v-model="grpName_comp"></md-input>
      </md-field>

      <md-field>
        <label>Distance</label>
        <md-input v-model="distance_comp" type="number" step="0.01">></md-input>
      </md-field>
    </template>
  </div>
</template>

<script>
export default {
  name: "CfgLinkTree",
  data() {
    return {};
  },
  props: {
    isShown: {
      type: Boolean,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    contextName: {
      type: String,
      required: true
    },
    grpName: {
      type: String,
      required: true
    },
    catName: {
      type: String,
      required: true
    },
    distance: {
      type: Number,
      required: true
    },
  },
  computed: {
    isShown_comp: {
      get() {
        return this.isShown;
      },
      set(value) {
        this.$emit('update:isShown', value);
      }
    },
    contextName_comp: {
      get() {
        return this.contextName;
      },
      set(value) {
        this.$emit('update:contextName', value);//emit the event to the parent to notiy the parent componentof any changes
      }
    },
    grpName_comp: {
      get() {
        return this.grpName;
      },
      set(value) {
        this.$emit('update:grpName', value);
      }
    },
    catName_comp: {
      get() {
        return this.catName;
      },
      set(value) {
        this.$emit('update:catName', value);
      }
    },
    /*distance_comp: {
      get() {
        return this.distance.toString() ;
      },
      set(value) {
        this.$emit('update:distance', parseInt(value));
      }
    }*/
    distance_comp: {
      get() {
        return this.distance.toString(); // Ensure it's displayed as a string in the input field
      },
      set(value) {
        const floatValue = parseFloat(value); // Parse the value as a float
        if (!isNaN(floatValue)) { // Ensure valid float before emitting
          this.$emit('update:distance', floatValue);
        } else {
          this.$emit('update:distance', 0); // Default to 0 if invalid
        }
      }
    }
  }
};
</script>

<style scoped></style>