<template>
  <div class="my-test-panel-container">
    <!-- Positions de travail section -->
    <div class="positions-section">
      <h3>Positions de travail</h3>
      <md-field>
        <label>Context Name</label>
        <md-input v-model="positionContextName" placeholder=" Context name"></md-input>
      </md-field>

      <md-field>
        <label>Category Name</label>
        <md-input v-model="positionCategoryName" placeholder="Category name"></md-input>
      </md-field>

      <md-field>
        <label>Group Name</label>
        <md-input v-model="positionGroupName" placeholder="Group name"></md-input>
      </md-field>
    </div>

    <!-- Existing Luminaires and Stores components -->
    <div class="">
      <cfgLinkTree :isShown.sync="lum_isShown" title="Luminaires" :grpName.sync="lum_grpName" :catName.sync="lum_catName" :contextName.sync="lum_contextName" :distance.sync="lum_distance"></cfgLinkTree>
      <cfgLinkTree :isShown.sync="store_isShown" title="Stores" :grpName.sync="store_grpName" :contextName.sync="store_contextName" :catName.sync="store_catName" :distance.sync="store_distance"></cfgLinkTree>
    </div>

    <!-- Confirm button -->
    <md-button @click="onConfim" :disabled="btnDisabled">confirm</md-button>

    <!-- List and progress bar -->
    <md-list v-if="modeTest">
      <md-list-item>
        <div class="md-list-item-text">
          <span>position de travail</span>
        </div>

        <md-button class="md-icon-button md-list-action" @click="showObject(positiondbid, positionbimFileId)">
          <md-icon>sms</md-icon>
        </md-button>
      </md-list-item>

      <md-divider class="md-inset"></md-divider>

      <md-subheader>objets</md-subheader>

      <md-list-item v-for="item in listDemo" :key="item.dbid">
        <div class="md-list-item-text">
          <span>{{ item.distance }}</span>
        </div>

        <md-button class="md-icon-button md-list-action" @click="showObject(item.dbid, item.bimFileId)">
          <md-icon>sms</md-icon>
        </md-button>
      </md-list-item>
    </md-list>

    <md-progress-bar v-if="loading" md-mode="indeterminate"></md-progress-bar>
  </div>
</template>

<script>
import cfgLinkTree from "./cfg-link-tree.vue"
import {hardwarecontexteGeneration}from "./mainfunction.js"
export default {
  name: "CreateNetworkTreeLink",
  data() {
    return {
      loading: false,
      lum_isShown: false,
      lum_contextName: "",
      lum_grpName: "",
      lum_catName: "",
      lum_distance: 5,
      store_isShown: false,
      store_contextName: "",
      store_grpName: "",
      store_catName: "",
      store_distance: 5,
      modeTest: false,
      positiondbid: 0, 
      positionbimFileId: "",
      listDemo: [
        // { dbid: 4917, distance: 2, bimFileId: "SpinalNode-..." }
      ],
      
      
      positionContextName: "",
      positionCategoryName: "",
      positionGroupName: "",
    };
  },
  components: {
    cfgLinkTree
  },
  methods: {
    async onConfim() {
      this.loading = true;
    
      console.log("onConfim");
      await hardwarecontexteGeneration(this.positionContextName, this.positionCategoryName, 
      this.positionGroupName, this.lum_contextName, this.lum_catName, this.lum_grpName, this.lum_distance,this.option);
      //console.log("Position Context:", this.positionContextName);
      
      try {
        // Code to create the network here
      } catch (error) {
        console.error(error);
      } finally {
        this.loading = false;
      }
    },
    opened(option, viewer) {
      console.log("opened option", option);
      console.log("opened viewer", viewer);
      this.option = option;
      this.viewer = viewer;
    },
    removed(option, viewer) {
      console.log("removed option", option);
      console.log("removed viewer", viewer);
    },
    closed(option, viewer) {
      console.log("closed option", option);
      console.log("closed viewer", viewer);
    },
    openDialog() {
      console.log("openDialog");

    },
      showObject(dbid, bimFileId) {
      console.log("showObject");
      spinal.BimObjectService.getModelByBimfile(bimFileId)
      this.viewer.select([dbid], spinal.BimObjectService.getModelByBimfile(bimFileId))


    },
  

  },
  computed: {
    btnDisabled() {
    // Check if `lum_isShown` is true and required fields are not empty
    if (this.lum_isShown) {
      if (
        this.lum_contextName !== "" &&
        this.lum_catName !== "" &&
        this.lum_grpName !== "" &&
        this.positionContextName !== "" &&
        this.positionCategoryName !== "" &&
        this.positionGroupName !== ""
      ) {
        return false; // Enable the button
      }
    }
    return true; // Disable the button if any condition is not met
  }
}
};


</script>

<style>
.my-test-panel-container {
 
  padding: 15px;
  
}

.positions-section {
  margin-bottom: 15px;
}

.positions-section h3 {
  margin-bottom: 10px;
  
}
</style>
