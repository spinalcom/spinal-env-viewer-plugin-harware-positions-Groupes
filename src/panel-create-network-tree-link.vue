<template>
  <div class="my-test-panel-container">
    <!-- Positions de travail section -->
    <div class="positions-section">
      <h3>Positions de travail</h3>
      <md-field>
        <label>Context Name</label>
        <md-input v-model="positionContextName" placeholder="Context name"></md-input>
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

    <!-- Gateway section -->
    <div class="Gateway-section">
      <h3>Gateway</h3>
      <md-field>
        <label>Context Name</label>
        <md-input v-model="GatewayContextName" placeholder="Context name"></md-input>
      </md-field>

      <md-field>
        <label>Category Name</label>
        <md-input v-model="GatewayCategoryName" placeholder="Category name"></md-input>
      </md-field>

      <md-field>
        <label>Group Name</label>
        <md-input v-model="GatewayGroupName" placeholder="Group name"></md-input>
      </md-field>
    </div>

    <!-- OPCUA Network section -->
    <div class="Network-section">
      <h3>OPCUA Network</h3>
      <md-field>
        <label>Network Context OPCUA</label>
        <md-input v-model="ContextNetworkName" placeholder="Network Context name"></md-input>
      </md-field>

      <md-field>
        <label>Network Organ OPCUA</label>
        <md-input v-model="OrganNetworkName" placeholder="Organ name"></md-input>
      </md-field>

      <md-field>
        <label>Network</label>
        <md-input v-model="NetworkName" placeholder="Network name"></md-input>
      </md-field>
    </div>

    <!-- Link Trees -->
    <div>
      <cfgLinkTree 
        :isShown.sync="lum_isShown" 
        title="Hardware contexte basé sur Luminaires" 
        :contextName.sync="lum_contextName">
      </cfgLinkTree>
      
      <cfgLinkTree 
        :isShown.sync="store_isShown" 
        title="Hardware contexte basé sur Stores" 
        :contextName.sync="store_contextName">
      </cfgLinkTree>
    </div>

    <!-- Confirm Button -->
    <md-button @click="onConfim" :disabled="btnDisabled">Confirm</md-button>

    <!-- List and Progress Bar -->
    <md-list v-if="modeTest">
      <md-list-item>
        <div class="md-list-item-text">
          <span>Position de travail</span>
        </div>
        <md-button class="md-icon-button md-list-action" @click="showObject(positiondbid, positionbimFileId)">
          <md-icon>sms</md-icon>
        </md-button>
      </md-list-item>

      <md-divider class="md-inset"></md-divider>

      <md-subheader>Objets</md-subheader>
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
import cfgLinkTree from "./cfg-link-tree.vue";
import { hardwarecontexteGeneration } from "./mainfunction.js";

export default {
  name: "CreateNetworkTreeLink",
  data() {
    return {
      loading: false,
      lum_isShown: false,
      lum_contextName: "Hardware Context Luminaires_old",

      store_isShown: false,
      store_contextName: "Hardware context positions Stores",

      modeTest: false,
      positiondbid: 0, 
      positionbimFileId: "",
      listDemo: [],
      
      positionContextName: "Gestion des équipements",
      positionCategoryName: "Typologie",
      positionGroupName: "Positions de travail",

      GatewayContextName: "Gestion des équipements",
      GatewayCategoryName: "Network",
      GatewayGroupName: "OPCUA",

      ContextNetworkName: "OPCUA Réseau",
      OrganNetworkName: "spinal-organ-opcua-dev-2",
      NetworkName: "WBOX3",
    };
  },
  components: {
    cfgLinkTree
  },
  methods: {
    async onConfim() {

      console.log("onConfim");
      this.loading = true;
      try {
        // Code to create the network here
                if (this.lum_isShown && !this.store_isShown) {
            await hardwarecontexteGeneration(
                this.positionContextName, 
                this.positionCategoryName, 
                this.positionGroupName, 
                
                this.GatewayContextName,
                this.GatewayCategoryName,
                this.GatewayGroupName,

                this.ContextNetworkName,
                this.OrganNetworkName,
                this.NetworkName,

                this.lum_contextName, 
                this.option
            );
        } else if (!this.lum_isShown && this.store_isShown) {
            await hardwarecontexteGeneration(
                this.positionContextName, 
                this.positionCategoryName, 
                this.positionGroupName, 
                
                this.GatewayContextName,
                this.GatewayCategoryName,
                this.GatewayGroupName,

                this.ContextNetworkName,
                this.OrganNetworkName,
                this.NetworkName,

                this.store_contextName, 
                this.option
            );
        } else if (this.lum_isShown && this.store_isShown) {
            // Exécution pour les deux cas
            await hardwarecontexteGeneration(
                this.positionContextName, 
                this.positionCategoryName, 
                this.positionGroupName, 
                
                this.GatewayContextName,
                this.GatewayCategoryName,
                this.GatewayGroupName,

                this.ContextNetworkName,
                this.OrganNetworkName,
                this.NetworkName,

                this.lum_contextName, 
                this.option
            );
            await hardwarecontexteGeneration(
                this.positionContextName, 
                this.positionCategoryName, 
                this.positionGroupName, 
                
                this.GatewayContextName,
                this.GatewayCategoryName,
                this.GatewayGroupName,

                this.ContextNetworkName,
                this.OrganNetworkName,
                this.NetworkName,

                this.store_contextName, 
                this.option
            );
        }
        


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
      const requiredFields = [

        this.positionContextName,
        this.positionCategoryName,
        this.positionGroupName,
        
        this.GatewayContextName,
        this.GatewayCategoryName,
        this.GatewayGroupName,

        this.ContextNetworkName,
        this.OrganNetworkName,
        this.NetworkName,

        
        this.lum_contextName,
        this.store_contextName,
      ];

      if (this.lum_isShown && this.store_isShown) {
        return !requiredFields.every(field => field !== "") ||
               this.lum_contextName === "" ||
               this.store_contextName === "";
      } else if (this.lum_isShown) {
        return !requiredFields.every(field => field !== "") ||
               this.lum_contextName === "";
      } else if (this.store_isShown) {
        return !requiredFields.every(field => field !== "") ||
               this.store_contextName === "";
      }
      return true;
    },
  },
};
</script>


<style>
.my-test-panel-container {
  padding: 15px;
}

.positions-section, .Gateway-section, .Network-section {
  margin-bottom: 15px;
}

.positions-section h3, .Gateway-section h3, .Network-section h3 {
  margin-bottom: 10px;
}
</style>

