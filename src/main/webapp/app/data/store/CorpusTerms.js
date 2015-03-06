Ext.define("Voyant.data.proxy.CorpusTerms", {
	extend: 'Ext.data.proxy.Ajax',
	constructor: function(config) {
		config = config || {};
		Ext.apply(config, {
            extraParams: Ext.apply(config.extraParams || {}, {
				 tool: 'corpus.CorpusTerms'
			})
		});
		Ext.applyIf(config, {
			url: Voyant.application.getTromboneUrl()
		})
		this.callParent([config]);
	},
	reader: {
	    type: 'json',
	    rootProperty: 'corpusTerms.terms',
	    totalProperty: 'corpusTerms.total'
	},
    simpleSortMode: true
})

Ext.define('Voyant.data.store.CorpusTerms', {
	extend: 'Ext.data.BufferedStore',
	mixins: ['Voyant.util.Transferable','Voyant.notebook.util.Embeddable'],
    model: 'Voyant.data.model.CorpusTerm',
    transferable: ['setCorpus'],
    requires: ['Voyant.panel.CorpusTerms','Voyant.panel.Cirrus'],
    embeddable: ['Voyant.panel.CorpusTerms','Voyant.panel.Cirrus'],
	config: {
		corpus: undefined
	},
	constructor : function(config) {
		
		config = config || {};
		
		Ext.applyIf(config, {
			pagePurgeCount: 0,
			pageSize: 100,
			leadingBufferZone: 100,
			remoteSort: true,
			autoLoad: false, // needs to be false until there's a corpus
		    proxy: Ext.create("Voyant.data.proxy.CorpusTerms")
		})

    	this.mixins['Voyant.notebook.util.Embeddable'].constructor.apply(this, arguments);
		this.callParent([config]);
		
		if (config && config.corpus) {
			if (config.corpus.then) {
				var dfd = Voyant.application.getDeferred(this);
				var me = this;
				config.corpus.then(function(corpus) {
					me.setCorpus(corpus);
					if (me.getAutoLoad()) {
						me.load({
							callback: function() {
								dfd.resolve(me);
							}
						})
					}
					else {
						dfd.resolve(me);
					}
				});
				var promise = Voyant.application.getPromiseFromDeferred(dfd);
				return promise;
			}
			else {
				this.setCorpus(config.corpus);
			}
		}


	},
	
	setCorpus: function(corpus) {
		if (corpus) {
			this.getProxy().setExtraParam('corpus', Ext.isString(corpus) ? corpus : corpus.getId());
		}
		this.callParent(arguments);
	}

});
