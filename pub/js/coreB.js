console.log("products-planos", products);
jQuery.noConflict()
// Elemento de menú
var CoreTerrenoApp  = function() {
	this.menu = [];
	this.paint = false;
	this.mFrente = 0;
	this.mFondo = 0;
	this.scale = 80;
	this.clickX = new Array();
	this.clickY = new Array();
	this.clickDrag = new Array();
	this.canvasCtx = null;
	this.canvas = null;
this.c = jQuery('#canvasDiv2');
	this.rotateMode = false;
	this.deleteMode = false;
this.jQuerydragging = null;
	this.objSelected = null;
	this.el_lw = 0;
	this.el_lh = 0;
	this.objId = 1;
	this.objLineId = 1;
	this.objs = [];
	this.sqlnsz = 10;
	this.ratio = 1;
	this.init();
};

CoreTerrenoApp.prototype = {
	constuctor: CoreTerrenoApp,
	init: function() {
		var ctx = this;
		console.log(this);
		ctx.setEvents(ctx);
	},
	getVisualScale: function(ctx) {
		var wn = ctx.mFrente*ctx.scale;
		console.log(wn);
		var mw = window.innerWidth - 25;
		console.log(mw);

		var ratio = 1;
		ratio = mw/wn;
		console.log(ratio);
		ctx.ratio = ratio;
		console.log("[Debug]", ctx.ratio);

	},
	setEvents: function(ctx) {
	jQuery('#createTerrenoBtn').click(function(e) {
		ctx.mFrente = jQuery('#numFrente').val();
		ctx.mFondo = jQuery('#numFondo').val();

		onlyNumbers = /^[0-9]+$/;

		console.log("yorch ctx.mFrente", ctx.mFrente);
		console.log("yorch ctx.mFondo", ctx.mFondo);

			if(ctx.mFrente === "" || ctx.mFondo === ""){
				alert("Debes ingresar los metros de frente y fondo que tiene tu espacio.");
				return;
			}
			if(!onlyNumbers.test(ctx.mFrente) || !onlyNumbers.test(ctx.mFrente)){
				alert("Solo se admiten numeros enteros.");
				return;
			}

		jQuery('.lienzo-dialog').show();
		jQuery('.terreno-dialog').hide();
			console.log(ctx.mFrente+'x'+ctx.mFondo);
			ctx.getVisualScale(ctx);
			console.log("ctx.mFrente", ctx.mFrente);
			console.log("ctx.mFondo", ctx.mFondo);
			console.log("ctx.scale", ctx.scale);
			console.log("ctx.ratio", ctx.ratio);
		jQuery('.lienzoHtml').width((ctx.mFrente*ctx.scale*ctx.ratio)-200);
		jQuery('.lienzoHtml').height((ctx.mFondo*ctx.scale*ctx.ratio)-200);
		jQuery('.lienzoHtml .H01').html(ctx.mFrente+' m');
		jQuery('.lienzoHtml .V01').html(ctx.mFondo+' m');
			ctx.initCanvas(ctx);
		});

	jQuery('#createNewBtn').click(function(e) {
		// jQuery('.lienzo-dialog').hide();
		// jQuery('.terreno-dialog').show();
		window.location.href = "http://132.148.10.55/rentandcompany/planos/";
		});

	jQuery('.tool').hover(function() {
		var id = jQuery(this).attr('id');
			console.log(id);
			var msg = '';
			if( id == 'btnTool1' ) {
				msg = 'Mesa Circular';
			}
			else if( id == 'btnTool2' ) {
				msg = 'Mesa Cuadrada';
			}
			else if( id == 'btnTool3' ) {
				msg = 'Linea';
			}
			else if( id == 'btnTool4' ) {
				msg = 'Silla';
			}
			else if( id == 'btnTool5' ) {
				msg = 'Arbusto';
			}
			else if( id == 'btnTool7' ) {
				msg = 'Borrar Todo';
			}
			else if( id == 'btnTool8' ) {
				msg = 'Modo Rotar Elemento';
			}
			else if( id == 'btnTool9' ) {
				msg = 'Borrar Elemento';
			}
		jQuery('.lienzo-dialog .desc').html(msg);
		},function() {
		jQuery('.lienzo-dialog .desc').html('&nbsp;');
		});

		jQuery('#createPdfBtn').click(function(e) {
			var pdf = new jsPDF({
				orientation: 'portrait',
				unit: 'mm',
				format: 'letter' // 215 x 279.4mm
			});
			pdf.text(20, 20, 'Tu terreno creado:');

			var wi = Number(document.querySelector(".lienzoHtml").style.width.slice(0,-2));
			var hi = Number(document.querySelector(".lienzoHtml").style.height.slice(0,-2));

			console.log("canvas frente: ", wi); // en px
			console.log("canvas fondo: ", hi); // en px
			// sheet bounds 205 mm x 240 mm

			var isLandscape = (wi >= hi);
			var ratio = wi/hi
			console.log("isLandscape: " + isLandscape);
			console.log("ratio: " + ratio);

			var w = 0, h = 0;
			if( isLandscape ) {
				w = 1;
				h = 1/ratio;
			}
			else {
				w = ratio;
				h = 1;
			}

			console.log("w: "+ w +", h: " +h);

			var wf = 0, hf = 0;
			var alfa = 1;
			var beta = 1;
			if( isLandscape ) {
				wf = w * alfa;
				hf = h * alfa;
			}
			else {
				wf = w * beta;
				hf = h * beta;
			}
			console.log(pdf);
			console.log(pdf.internal);
			console.log(pdf.internal.pageSize);
			var wdoc = pdf.internal.pageSize.width-10;
			var hdoc = pdf.internal.pageSize.height-40;
			// bounds
			console.log("wdoc: "+ wdoc +", hdoc: " +hdoc);

			var wfinal = 1;
			var hfinal = 1;

			if( isLandscape ) {
				wfinal = wdoc;
				hfinal = wfinal * h;
			}
			else {
				hfinal = hdoc;
				wfinal = hdoc *ratio;
			}
			console.log("wfinal: "+ wfinal +", hfinal: " +hfinal);

			window.scrollTo(0,0);
  			//pdf.addImage(imgData, 'JPEG', 0, 0);
			html2canvas(document.querySelector(".lienzoHtml")).then(canvas => {
			    //document.body.appendChild(canvas)
			    var imgData = canvas.toDataURL("image/jpeg", 1.0);
				console.log(imgData);
				//jQuery('#dudu').attr('src', imgData);
			    pdf.addImage(imgData, 'JPEG', 5, 30, wfinal, hfinal);

			    pdf.save("terreno_"+ Date.now() +".pdf");
			});
		});

		ctx.setDeletableElement(ctx,'');
	},
	initCanvas: function(ctx) {
		var canvas = document.getElementById("kanvas");
		ctx.canvasCtx = canvas.getContext("2d");
		ctx.canvas = canvas;
		ctx.setToolboxEvents(ctx);
		canvas.width = ctx.mFrente*ctx.scale*ctx.ratio;
		canvas.height = ctx.mFondo*ctx.scale*ctx.ratio;
	},
	rotateObject: function(ctx) {
		console.log('rotateMode');
		console.log(ctx.objSelected);
		if(ctx.objSelected==null) {
			alert('Debe seleccionar un elemento del terreno dando click o tap en el rotara 22.5º por vez.')
		}
		else {
			var el = ctx.objSelected[0]; //document.getElementById("thing");
			var st = window.getComputedStyle(el, null);
			var tr = st.getPropertyValue("-webkit-transform") ||
         			st.getPropertyValue("-moz-transform") ||
         			st.getPropertyValue("-ms-transform") ||
         			st.getPropertyValue("-o-transform") ||
         			st.getPropertyValue("transform") ||
         			"FAIL";
			// With rotate(30deg)...
			// matrix(0.866025, 0.5, -0.5, 0.866025, 0px, 0px)
			console.log('Matrix: ' + tr);
			
			var angle = 0;
			if(tr == 'none') {
				angle = 0;

			}
			else if(tr) {
				var values = tr.split('(')[1].split(')')[0].split(',');
				var a = values[0];
				var b = values[1];
				var c = values[2];
				var d = values[3];
				angle = Math.round(Math.atan2(b, a) * (180/Math.PI));
			}
			else {
				alert('No hay nada que rotar, agregue un elemento.');
			}
			console.log(angle);
			angle += 22.5;
			console.log(angle);
			ctx.objSelected.css({
				"-webkit-transform": 'rotate('+angle+'deg)',
				"-moz-transform": 'rotate('+angle+'deg)',
				"-ms-transform": 'rotate('+angle+'deg)',
				"-o-transform": 'rotate('+angle+'deg)',
				"transform": 'rotate('+angle+'deg)',
			});
		} 
	},
	toggleDeletion: function(ctx) {
		ctx.deleteMode = !ctx.deleteMode;
	    console.log('deleteMode:' + ctx.deleteMode);
	jQuery("#btnTool9").css('background',ctx.deleteMode?'#f44':'#fff');
	},
	setDeletableElement: function(ctx, elSelector) {
	//jQuery(elSelector).click(function(e) {
	jQuery('body').on("click", "#canvasDiv2 div", function(e) {
	    	console.log('click');
		ctx.objSelected = jQuery(this);
		jQuery("#canvasDiv2 div").removeClass('OSel');
		jQuery(this).addClass('OSel');
	    	if(ctx.deleteMode) {
			jQuery(this).remove();
	    	}
	    	//elseif(ctx.rotateMode)
	    });
	},
	setToolboxEvents: function(ctx) {
	jQuery('#btnTool1').click(function(e) {
			//ctx.drawCircularTable(ctx);
			ctx.toggleDropdown(ctx, 1);
		});
	jQuery('#btnTool2').click(function(e) {
			//ctx.drawSquareTable(ctx);
			ctx.toggleDropdown(ctx, 2);
		});
	jQuery('#btnTool3').click(function(e) {
			ctx.unToggleAllButton(ctx);
			ctx.drawLine(ctx);
		});
	jQuery('#btnTool4').click(function(e) {
			//ctx.drawChair(ctx);
			ctx.toggleDropdown(ctx, 4);
		});
	jQuery('#btnTool5').click(function(e) {
			ctx.unToggleAllButton(ctx);
			ctx.drawTree(ctx);
		});
	jQuery('#btnTool7').click(function(e) {
			ctx.unToggleAllButton(ctx);
			ctx.clearCanvas(ctx);
		});
	jQuery('#btnTool8').click(function(e) {
			ctx.unToggleAllButton(ctx);
			ctx.rotateObject(ctx);
		});
	jQuery('#btnTool9').click(function(e) {
			ctx.unToggleAllButton(ctx);
			ctx.toggleDeletion(ctx);
		});

	jQuery('#btnTool1A').click(function(e) {
		// jQuery('#numW').val(5);
		// jQuery('#numH').val(5);
			ctx.drawCircularTable(ctx);
		});
	jQuery('#btnTool1B').click(function(e) {
		// jQuery('#numW').val(2);
		// jQuery('#numH').val(2);
			ctx.drawCircularTable(ctx);
		});
	jQuery('#btnTool1C').click(function(e) {
		// jQuery('#numW').val(3);
		// jQuery('#numH').val(3);
			ctx.drawCircularTable(ctx);
		});
	jQuery('#btnTool1D').click(function(e) {
		// jQuery('#numW').val(.5);
		// jQuery('#numH').val(.5);
			ctx.drawCircularTable(ctx);
		});
	jQuery('#btnTool2A').click(function(e) {
		// jQuery('#numW').val(1.5);
		// jQuery('#numH').val(1.5);
			ctx.drawSquareTable(ctx);
		});
	jQuery('#btnTool2B').click(function(e) {
		// jQuery('#numW').val(2);
		// jQuery('#numH').val(2);
			ctx.drawSquareTable(ctx);
		});
	jQuery('#btnTool2C').click(function(e) {
		// jQuery('#numW').val(3);
		// jQuery('#numH').val(3);
			ctx.drawSquareTable(ctx);
		});
	jQuery('#btnTool2D').click(function(e) {
			ctx.drawSquareTable(ctx);
		});
	// CURVO	
	jQuery('#btnTool4A').click(function(e) {
			ctx.drawChair(ctx, 2);
		});
	// CONCAVO
	jQuery('#btnTool4B').click(function(e) {
			ctx.drawChair(ctx, 3);
		});
	jQuery('#btnTool4C').click(function(e) {
			ctx.drawChair(ctx,4);
		});
	jQuery('#btnTool4D').click(function(e) {
			ctx.drawChair(ctx,1);
		});
	jQuery("#buscarItem").click(function(){
		var inputIdProduct = jQuery("#idProduct").val();
			var host = 'http://132.148.10.55/rentandcompany/';

			if(inputIdProduct !== ''){
				console.log("se ha hecho click", inputIdProduct);
				var product = window.products.filter(function(item){
					return item.id === inputIdProduct
				});

				if(Array.isArray(product) && product.length > 0){
					console.log("product", product);
					jQuery("#product-name").html(product[0].name);
					jQuery("#product-id").html(product[0].id);
					jQuery("#product-img").attr({"src" : host + product[0].url});

					var W = product[0].size.split("X")[0];
					var H = product[0].size.split("X")[1];

					jQuery('#numW').val(W);
					jQuery('#numH').val(H);
					jQuery('#id_element').val(product[0].id);
					jQuery('#type_element').val(product[0].type);
					console.log("");
					switch(product[0].type){
						case "10":
						case "14":
							if(product[0].shape === "circulo" || product[0].shape === "ovalo") {
								jQuery('#numW').val(W);
								jQuery('#numH').val(W);
								jQuery('#btnTool1A').click();
							}
							else  jQuery('#btnTool2A').click();
							break;
						case'Silla':
							jQuery('#btnTool4D').click();
							break;
						case'Sillon':
							if(product[0].shape === "concavo") {
								jQuery('#btnTool4A').click();
							} else if(product[0].shape === "curvo"){
								jQuery('#btnTool4B').click();
							}
							break;
					}
					// if(product[0].type && product[0].type === 'Mesas' && )
				} else {
					alert("producto no encontrado");
				}

			} else {
				alert("Debes agregar un producto");
			}
		});
	jQuery("#addQuotation").click(function(){
			// products=1022=10,2299=5
			var k = jQuery("#kanvas").siblings();
			var uniqueItems = [];
			var allItems = [];
			var url = 'http://132.148.10.55/rentandcompany/pedido?products=';
			
			k.map(function(item){
				console.log('items --- item: ',item);
				var i = k[item].getAttribute('data-element') ? k[item].getAttribute('data-element').split("-")[0] : null;
				console.log('items --- i:', i);
				if(i !== null){
					if(uniqueItems.indexOf(i) === -1){
						uniqueItems.push(i);
					}
					allItems.push(i);
				}
			});

			console.log("uniqueItems", uniqueItems);
			console.log("allItems", allItems);


			for (let i = 0; i < uniqueItems.length; i++) {

				var product = uniqueItems[i];
				var counter = 0;
				
				for (let j = 0; j < allItems.length; j++) {
					if(product === allItems[j]){
						counter++;
					}
				}

				url += product + '=' + counter + ',';
				
			}

			console.log('url: ', url);
			
			window.location.href = url.slice(0, -1);
			
		});
	},
	toggleDropdown: function(ctx, id) {
		
		var sel2 = '#btnTool' + id;
		var sel = sel2 + ' span';
	var d = jQuery(sel).data('tg');

		ctx.unToggleAllButton(ctx);
		
		if( d ) {
		jQuery(sel).hide();
		jQuery(sel2).removeClass('toggled');
		jQuery(sel).data('tg', false);
		}
		else {
		jQuery(sel).show();
		jQuery(sel2).addClass('toggled');
		jQuery(sel).data('tg', true);
		}
		
	},
	unToggleAllButton: function(ctx) {
		var sel3 = '.tool.toggled';
	jQuery(sel3+ ' .dd').hide();
	jQuery(sel3+' span').data('tg', false);
	jQuery(sel3).removeClass('toggled');
	},
	clearCanvas: function(ctx) {
		//var txt;
		var r = confirm("Se borrara completamente el diseno, esta operacion es irreversible, ¿desea continuar?.");
		if (r == true) {
		    //txt = "You pressed OK!";
		jQuery('#canvasDiv2 div').remove();
		    ctx.canvasCtx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
		} else {
		    //txt = "You pressed Cancel!";
		}
	},
	addClick: function(ctx, x, y, dragging) {
		ctx.clickX.push(x);
		ctx.clickY.push(y);
		ctx.clickDrag.push(dragging);
	},
/*	redraw: function(ctx){
  		ctx.canvasCtx.clearRect(0, 0, ctx.canvasCtx.canvas.width, ctx.canvasCtx.canvas.height); // Clears the canvas
  		ctx.canvasCtx.strokeStyle = "#df4b26";
  		ctx.canvasCtx.lineJoin = "round";
  		ctx.canvasCtx.lineWidth = 5;
			
  		for(var i=0; i < ctx.clickX.length; i++) {		
    		ctx.canvasCtx.beginPath();
    		if(ctx.clickDrag[i] && i) {
      			ctx.canvasCtx.moveTo(ctx.clickX[i-1], ctx.clickY[i-1]);
     		} else {
       			ctx.canvasCtx.moveTo(ctx.clickX[i]-1, ctx.clickY[i]);
     		}
     		ctx.canvasCtx.lineTo(ctx.clickX[i], ctx.clickY[i]);
     		ctx.canvasCtx.closePath();
     		ctx.canvasCtx.stroke();
  		}
	},*/
	addDraggable: function(ctx, id, stopCallback) {
	//jQuery('#'+prefix+'-'+ctx.objId).draggable({
	jQuery('#'+id).draggable({
    		containment: '#canvasDiv2',
    		stop: function(event, ui) {
    			console.log(stopCallback);
    			if(stopCallback) {
    				stopCallback(event, ui);
    			}
    		}
    	});
    	//ctx.objId++;
	},
	drawSquareTable: function(ctx) {
	var w = jQuery('#numW').val()*ctx.scale;
	var h = jQuery('#numH').val()*ctx.scale;
	var id = jQuery('#id_element').val();
	var type = jQuery('#type_element').val();

    	var style = 'style="width:'+w+'px; height:'+h+'px;"';
    	ctx.c.append('<div id="osq-'+ctx.objId+'" class="OSQ1" '+style+' data-element="'+ id +'-'+ type +'" ></div>');
    	ctx.addDraggable(ctx,'osq-'+ctx.objId+'');
	jQuery('#osq-'+ctx.objId).width(w*ctx.ratio);
	jQuery('#osq-'+ctx.objId).height(h*ctx.ratio);
    	ctx.objId++;
	},
	drawCircularTable: function(ctx) {

	console.log( jQuery('#numW').val() + ' ' + jQuery('#numH').val() );
	var w = jQuery('#numW').val()*ctx.scale;
	var h = jQuery('#numH').val()*ctx.scale;
	var r = jQuery('#numW').val()*ctx.scale/.5;
	var id = jQuery('#id_element').val();
	var type = jQuery('#type_element').val();

    	var style = 'style="width:'+w+'px; height:'+h+'px; border-radius:'+r+'px;"';
    	ctx.c.append('<div id="ocl-'+ctx.objId+'" class="OCL1" '+style+' data-element="'+ id +'-'+ type +'" ></div>');
    	ctx.addDraggable(ctx,'ocl-'+ctx.objId+'');
	jQuery('#ocl-'+ctx.objId).width(w*ctx.ratio); // (80*ctx.ratio
	jQuery('#ocl-'+ctx.objId).height(h*ctx.ratio);
    	ctx.objId++;
	},
	drawChair: function(ctx, typeId) {
	var id = jQuery('#id_element').val();
	var type = jQuery('#type_element').val();
		ctx.c.append('<div id="och-'+ctx.objId+'" class="OCH'+typeId+'" data-element="'+ id +'-'+ type +'" ></div>');
		ctx.addDraggable(ctx,'och-'+ctx.objId+'');
		var w = 42, h = 42;
		if(typeId == 2 || typeId == 3) {
			w = jQuery('#numW').val()*ctx.scale;
			h = jQuery('#numH').val()*ctx.scale;
		}

		
	jQuery('#och-'+ctx.objId).width(w*ctx.ratio); // // 42*ctx.ratio
	jQuery('#och-'+ctx.objId).height(h*ctx.ratio);
		ctx.objId++;
	},
	drawTree: function(ctx) {
		ctx.c.append('<div id="otr-'+ctx.objId+'" class="OTR1"></div>');
		ctx.addDraggable(ctx,'otr-'+ctx.objId+'');
	jQuery('#otr-'+ctx.objId).width(80*ctx.ratio);
	jQuery('#otr-'+ctx.objId).height(80*ctx.ratio);
		ctx.objId++;
	},
	drawLine: function(ctx) {
		var lineObj = {
			id: ctx.objLineId,
			pini: 'ol1-'+ctx.objLineId,
			pfin: 'ol2-'+ctx.objLineId,
			//plin: 'ol0-'+ctx.objId
			a: 0
		};
		ctx.objs.push(lineObj);
		//ctx.c.append('<div class="OLN1" id="ol0-'+ctx.objId+'"></div>');
		ctx.c.append('<div class="OLN1" id="'+lineObj.pini+'"></div>');
		ctx.addDraggable(ctx,lineObj.pini,function(e, ui) {
			//ctx.drawCanvasLine(ctx, lineObj);
			ctx.drawAllLines(ctx);
		});
		ctx.c.append('<div class="OLN1" id="'+lineObj.pfin+'"></div>');
	jQuery('#'+lineObj.pfin).css('top','200px');
		ctx.addDraggable(ctx,lineObj.pfin,function(e, ui) {
			//ctx.drawCanvasLine(ctx, lineObj);
			ctx.drawAllLines(ctx);
		});
		//ctx.drawCanvasLine(ctx, lineObj);
		ctx.drawAllLines(ctx);

		ctx.objLineId++;
		ctx.objId++;
		ctx.lineMode = true;
	},
	drawAllLines: function(ctx) {
		ctx.canvasCtx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
		for(var key in ctx.objs) {
			ctx.drawCanvasLine(ctx, ctx.objs[key]);
		}
	},
	drawCanvasLine: function(ctx, lineObj) {
		console.log(lineObj);
		
		ctx.canvasCtx.fillStyle = "#FF0000";
		ctx.canvasCtx.beginPath();
        ctx.canvasCtx.lineWidth = 5;
	var el1pos = jQuery('#'+lineObj.pini).position();
	var el2pos = jQuery('#'+lineObj.pfin).position();
        console.log(el1pos);
        console.log(el2pos);
        var fs = 1;
        ctx.canvasCtx.moveTo(el1pos.left/fs+ctx.sqlnsz/2, el1pos.top/fs+ctx.sqlnsz/2);
        ctx.canvasCtx.lineTo(el2pos.left/fs+ctx.sqlnsz/2, el2pos.top/fs+ctx.sqlnsz/2);
        ctx.canvasCtx.stroke();
	}
};

var CoreTerrenoAppInstance = null;

jQuery(function() {
	CoreTerrenoAppInstance = new CoreTerrenoApp();
});