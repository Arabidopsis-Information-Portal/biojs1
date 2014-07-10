 /**
  * Displays pharmacology results for a target. The results can have various filters applied and be paginated. Requires an app key and ID available from https://dev.openphacts.org
  *
  * @class
  * @extends Biojs
  * @author <a href = "mailto:ianwdunlop@gmail.com">Ian Dunlop</a>
  * @version 1.0.0
  * @license MIT http://opensource.org/licenses/MIT
  *
  * @requires <a href='http://code.jquery.com/jquery-1.9.1.js'>jQuery Core 1.9.1</a>
  * @dependency <script language="JavaScript" type="text/javascript" src="../biojs/dependencies/jquery/jquery-1.9.1.min.js"></script>
  *
  * @requires <a href='https://github.com/openphacts/ops.js'>OPS.js</a>
  * @dependency <script src="../biojs/dependencies/openphacts/ops.js" type="text/javascript"></script>
  *
  * @requires <a href='http://handlebarsjs.com/'>Handlebars</a>
  * @dependency <script src="../biojs/dependencies/handlebars/handlebars-v1.3.0.js" type="text/javascript"></script>
  *
  * @requires <a href='../biojs/dependencies/openphacts/helpers.js'>Handlebars helpers</a>
  * @dependency <script src="../biojs/dependencies/openphacts/helpers.js" type="text/javascript"></script>
  *
  * @requires <a href='../biojs/css/biojs.openphacts.css'>Open PHACTS CSS</a>
  * @dependency <link href="../biojs/css/biojs.openphacts.css" rel="stylesheet" type="text/css" />
  *
  * @param {Object} options An object with the options for the component.
  *
  * @option {string} appID
  *    Application ID used to access the Open PHACTS API.
  *
  * @option {string} appKey
  *    Application Key used to access the Open PHACTS API.
  *
  * @option {string} appURL
  *    Location of the Open PHACTS API.
  *
  * @option {string} URI
  *    URI for the target image you want to display.
  *
  * @option {string} [template]
  *    You can define the look and feel of the display by providing a handlebars HTML template. The variables you can use are defined in the
  *    OPS.js CompoundSearch class
  *
  * @option {string} [assayOrganism]
  *    Only return results which have this Assay Organism eg 'Homo sapiens'
  *
  * @option {string} [targetOrganism]
  *    Only return results which have this Target Organism eg 'Homo sapiens'
  *
  * @option {string} [activity]
  *    Only return results for this activity eg 'IC50'
  *
  * @option {string} [activityCondition]
  *    Only return results which have an activity value corresponding to this limit eg return activities greater than would be '>'
  *
  * @option {string} [activityValue]
  *    Only return results which have this value or use along with activityCondition
  *
  * @option {Array} [activityRelations]
  *    Return results which have the relations provided. Add as many from '>', '<', '>=', '<=', ='
  *
  * @option {String} [pchemblValue]
  *    Return results to those with this pchemblValue
  *
  * @option {string} [pchemblCondition]
  *    Return results with a pchemblValue limited by this condition eg '<'
  *
  * @option {string} [sortBy]
  *    Sort the results by this column
  *
  * @option {string} [sortDirection]
  *    Sort the results in this direction. Choose from 'ascending' or 'descending'.
  *
  * @option {string} [lens]
  *    Apply this scientific lens to the results.
  *
  * @option {string} [page]
  *    Show this page of results
  *
  * @option {string} [pageSize]
  *    The number of results to show in each page.
  *
  * @example
  * var instance = new Biojs.OPSTargetPharmacology({
  *    appID: '949a7c9c',
  *    appKey: '734a274b418b0dbe57fc40f86e85e20e',
  *    appURL: 'https://beta.openphacts.org/1.3',
  *    URI: 'http://www.conceptwiki.org/concept/5de0f011-68e0-4917-bac2-6d65e8f7effb',
  *    assayOrganism: 'Homo sapiens',
  *    target: 'YourOwnDivId'
  * });
  */
 Biojs.OPSTargetPharmacology = Biojs.extend(
     /** @lends Biojs.OPSTargetPharmacology# */
     {
         page: 1,
	 pageSize: 50,
         assayOrganism: null,
         targetOrganism: null,
         activity: null,
         activityValue: null,
         minActivityValue: null,
         minExActivityValue: null,
         maxActivityValue: null,
         maxExActivityValue: null,
         unit: null,
         activityRelation: null,
         actualPchemblValue: null,
         minPchemblValue: null,
         minExPchemblValue: null,
         maxPchemblValue: null,
         maxExPchemblValue: null,
         targetType: null,

         constructor: function(options) {

             this.base(options);
             var self = this;
             page = self.opt.page != null ? self.opt.page : 1;
	     pageSize = self.opt.pageSize != null ? self.opt.pageSize : 50;
             assayOrganism = self.opt.assayOrganism;
             targetOrganism = self.opt.targetOrganism;
             var lens = null;
             activity = self.opt.activity;
             unit = self.opt.activityUnit;
             var condition = self.opt.activityCondition;
             var currentActivityValue = self.opt.activityValue;
             // only set activity filter if all filter boxes have been selected
             if (unit != null && activity != null && condition != null && currentActivityValue != null) {
                 switch (condition) {
                     case '>':
                         minExActivityValue = currentActivityValue;
                         break;
                     case '<':
                         maxExActivityValue = currentActivityValue;
                         break;
                     case '=':
                         activityValue = currentActivityValue;
                         break;
                     case '<=':
                         maxActivityValue = currentActivityValue;
                         break;
                     case '>=':
                         minActivityValue = currentActivityValue;
                         break;
                 }
             }
             // if there are any relations then add them all to the string with the "|" (OR) separator otherwise activityRelation will still be null
             // a trailing "|" is fine according to tests on the LD API
             if (self.opt.activityRelations != null) {
                 activityRelation = "";
                 $.each(self.opt.activityRelations, function(index, relation) {
                     activityRelation = activityRelation + relation + "|";
                 });
             }
             var pchemblCondition = self.opt.pchemblCondition;
             var currentPchemblValue = self.opt.pchemblValue;
             // pchembl filter only valid if all filter bits selected
             if (pchemblCondition != null && currentPchemblValue != null) {
                 switch (pchemblCondition) {
                     case '>':
                         minExPchemblValue = currentPchemblValue;
                         break;
                     case '<':
                         maxExPchemblValue = currentPchemblValue;
                         break;
                     case '=':
                         actualPchemblValue = currentPchemblValue;
                         break;
                     case '<=':
                         maxPchemblValue = currentPchemblValue;
                         break;
                     case '>=':
                         minPchemblValue = currentPchemblValue;
                         break;
                 }
             }
             if (self.opt.sortBy !== null && self.opt.sortDirection !== null) {
                 // we have previously sorted descending on a header and it is still current
                 if (self.opt.sortDirection === "ascending") {
                     sortBy = '?' + self.opt.sortBy;
                 } else if (self.opt.sortDirection === "descending") {
                     sortBy = 'DESC(?' + self.opt.sortBy + ')';

                 }
             }
             var pharmaTemplate;
             if (self.opt.template) {
                 pharmaTemplate = self.opt.template;
             } else {
	pharmaTemplate = '<table id="target-pharma-table"><thead><tr><th class="lead">Compound</th><th class="lead">Target</th><th></th><th class="lead" style="text-align:left;">Assay</th><th></th><th></th><th class="lead">Activity</th><th></th><th></th><th></th><th></th><th></th></tr>';
	pharmaTemplate += '<tr><th align="center">Name</th>';
pharmaTemplate += '<th>Organism</th>';
	pharmaTemplate += '<th>Organism</th>';
pharmaTemplate += '<th>Description</th>';
pharmaTemplate += '<th>Type</th>';
pharmaTemplate += '<th>Relation</th>';
pharmaTemplate += '<th>Value</th>';
pharmaTemplate += '<th>Units</th>';
pharmaTemplate += '<th>Mol Weight</th>';
pharmaTemplate += '<th>SMILES</th>';
pharmaTemplate += '<th>InChi</th>';
pharmaTemplate += '<th>InChiKey</th>';
pharmaTemplate += '<th>pChembl</th></tr></thead>';
pharmaTemplate += '<tbody id="pharmacology-table-body">';
pharmaTemplate += '{{#each pharmacology}}<tr class="record-deco"><td class="cell-basictext">{{this.compoundPrefLabel}}</td>';
pharmaTemplate += '<td class="cell-basictext">{{#each this.targetOrganisms}} {{this.organism}} {{/each}}</td>';
pharmaTemplate += '<td class="cell-basictext">{{this.assayOrganism}}</td>';
pharmaTemplate += '<td class="cell-longtext">{{this.assayDescription}}</td>';
pharmaTemplate += '<td class="lead cell-basictext">{{this.activityActivityType}}</td>';
pharmaTemplate += '<td class="lead cell-basictext">{{this.activityRelation}}</td>';
pharmaTemplate += '<td class="lead cell-basictext">{{this.activityStandardValue}}</td>';
pharmaTemplate += '<td class="lead cell-basictext">{{this.activityStandardUnits}}</td>';
pharmaTemplate += '<td class="cell-basictext" >{{this.compoundFullMwt}}</td>';
pharmaTemplate += '<td class="cell-longtext" style="word-wrap:break-word;">{{this.compoundSmiles}}</td>';
pharmaTemplate += '<td class="cell-longtext" style="word-wrap:break-word;">{{this.compoundInchi}}</td>';
pharmaTemplate += '<td class="cell-longtext" style="word-wrap:break-word;">{{this.compoundInchikey}}</td>';
pharmaTemplate += '<td class="cell-basictext" >{{this.pChembl}}</td></tr>{{/each}}</tbody></table>';
             }
      var searcher = new Openphacts.TargetSearch(this.appURL, this.appID, this.appKey);
      var pharmaCallback=function(success, status, response){
      if (success && response) {
        var pharmaResults = searcher.parseTargetPharmacologyResponse(response);
var hbsTemplate = Handlebars.compile(pharmaTemplate);
                     var html = hbsTemplate({
                         'pharmacology': pharmaResults
                     });
                     jQuery('#' + self.opt.target).replaceWith(html);

      } else {
	      //throw an error
      }
    };
    var countCallback=function(success, status, response){
      if (success && response) {
          var count = searcher.parseTargetPharmacologyCountResponse(response);
          if (count > 0) {
              searcher.targetPharmacology(self.opt.URI, self.assayOrganism, self.targetOrganism, self.activity, self.activityValue, self.minActivityValue, self.minExActivityValue, self.maxActivityValue, self.maxExActivityValue, self.unit, self.activityRelation, self.actualPchemblValue, self.minPchemblValue, self.minExPchemblValue, self.maxPchemblValue, self.maxExPchemblValue, self.targetType, self.page, self.pageSize, self.sortBy, self.opt.lens, pharmaCallback);
          }
      }
    };
        searcher.targetPharmacologyCount(this.URI, this.assayOrganism, this.targetOrganism, this.activity, this.activityValue, this.minActivityValue, this.minExActivityValue, this.maxActivityValue, this.maxExActivityValue, this.unit, this.activityRelation, this.actualPchemblValue, this.minPchemblValue, this.minExPchemblValue, this.maxPchemblValue, this.maxExPchemblValue, this.targetType, this.opt.lens, countCallback);

         },
         opt: {
             target: 'YourOwnDivId',
             appID: undefined,
             appKey: undefined,
             appURL: undefined,
             URI: undefined,
             template: undefined,
             assayOrganism: undefined,
             targetOrganism: undefined,
             activity: undefined,
             activityCondition: undefined,
             activityValue: undefined,
             activityRelations: undefined,
             pchemblValue: undefined,
             pchemblCondition: undefined,
             sortBy: undefined,
             sortDirection: undefined,
             lens: undefined,
             page: undefined,
             pageSize: undefined
         },

         /**
          * Array containing the supported event names
          * @name Biojs.OPSTargetPharmacology-eventTypes
          */
         eventTypes: [
             /**
              * @name Biojs.OPSTargetPharmacology#error
              * @event
              * @param {function} actionPerformed A function which receives an {@link Biojs.Event}
              * object as argument.
              * @eventData {string} message The error message
              * @example
              * instance.onError(
              *    function( objEvent ) {
              *       alert(objEvent.message);
              *    }
              * );
              */
             "error"
         ],
         /**
          * Fetch more pharmacology results and replace the current ones in the table
          * @param {Number} page The required page
          * @param {string} [template] Handlebars HTML template to populate with results
          * @param {string} [replaceID] The id of the current HTML element to replace. The element which replaces it will be given the same id
          */
         fetchPage: function(page, template, replaceID) {
             //fetch pharma for page and replace current results.
             var self = this;
             var searcher = new Openphacts.TargetSearch(self.opt.appURL, self.opt.appID, self.opt.appKey);
             var pharmaTemplate;
             if (template) {
                 pharmaTemplate = template;
             } else {
var pharmaTemplate = '<tbody id="pharmacology-table-body">';
pharmaTemplate += '{{#each pharmacology}}<tr class="record-deco"><td class="cell-basictext">{{this.compoundPrefLabel}}</td>';
pharmaTemplate += '<td class="cell-basictext">{{#each this.targetOrganisms}} {{this.organism}} {{/each}}</td>';
pharmaTemplate += '<td class="cell-basictext">{{this.assayOrganism}}</td>';
pharmaTemplate += '<td class="cell-longtext">{{this.assayDescription}}</td>';
pharmaTemplate += '<td class="lead cell-basictext">{{this.activityActivityType}}</td>';
pharmaTemplate += '<td class="lead cell-basictext">{{this.activityRelation}}</td>';
pharmaTemplate += '<td class="lead cell-basictext">{{this.activityStandardValue}}</td>';
pharmaTemplate += '<td class="lead cell-basictext">{{this.activityStandardUnits}}</td>';
pharmaTemplate += '<td class="cell-basictext" >{{this.compoundFullMwt}}</td>';
pharmaTemplate += '<td class="cell-longtext" style="word-wrap:break-word;">{{this.compoundSmiles}}</td>';
pharmaTemplate += '<td class="cell-longtext" style="word-wrap:break-word;">{{this.compoundInchi}}</td>';
pharmaTemplate += '<td class="cell-longtext" style="word-wrap:break-word;">{{this.compoundInchikey}}</td>';
pharmaTemplate += '<td class="cell-basictext" >{{this.pChembl}}</td></tr>{{/each}}</tbody>';
             }
             var pharmaCallback = function(success, status, response) {
                 if (success && response) {
                     var pharmaResults = searcher.parseTargetPharmacologyResponse(response);
                     var hbsTemplate = Handlebars.compile(pharmaTemplate);
                     var html = hbsTemplate({
                         'pharmacology': pharmaResults
                     });
                     jQuery(replaceID != null ? '#' + replaceID : '#pharmacology-table-body').replaceWith(html);
                     self.page = page;
                 } else {
                     //throw an error
                 }
             };
             searcher.targetPharmacology(self.opt.URI, self.assayOrganism, self.targetOrganism, self.activity, self.activityValue, self.minActivityValue, self.minExActivityValue, self.maxActivityValue, self.maxExActivityValue, self.unit, self.activityRelation, self.actualPchemblValue, self.minPchemblValue, self.minExPchemblValue, self.maxPchemblValue, self.maxExPchemblValue, self.targetType, page, self.pageSize, self.sortBy, self.opt.lens, pharmaCallback);

         }
     }
 )
