console.log("products", products);
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
	this.c = $('#canvasDiv2');
	this.rotateMode = false;
	this.deleteMode = false;
	this.$dragging = null;
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
		$('#createTerrenoBtn').click(function(e) {
			ctx.mFrente = $('#numFrente').val();
			ctx.mFondo = $('#numFondo').val();

			onlyNumbers = /^[0-9]+$/;

			if(ctx.mFrente === "" || ctx.mFondo === ""){
				alert("Debes ingresar los metros de frente y fondo que tiene tu espacio.");
				return;
			}
			if(!onlyNumbers.test(ctx.mFrente) || !onlyNumbers.test(ctx.mFrente)){
				alert("Solo se admiten numeros enteros.");
				return;
			}

			$('.lienzo-dialog').show();
			$('.terreno-dialog').hide();
			console.log(ctx.mFrente+'x'+ctx.mFondo);
			ctx.getVisualScale(ctx);
			console.log("ctx.mFrente", ctx.mFrente);
			console.log("ctx.mFondo", ctx.mFondo);
			console.log("ctx.scale", ctx.scale);
			console.log("ctx.ratio", ctx.ratio);
			$('.lienzoHtml').width((ctx.mFrente*ctx.scale*ctx.ratio)-200);
			$('.lienzoHtml').height((ctx.mFondo*ctx.scale*ctx.ratio)-200);
			$('.lienzoHtml .H01').html(ctx.mFrente+' m');
			$('.lienzoHtml .V01').html(ctx.mFondo+' m');
			ctx.initCanvas(ctx);
		});

		$('#createNewBtn').click(function(e) {
			$('.lienzo-dialog').hide();
			$('.terreno-dialog').show();
		});

		$('.tool').hover(function() {
			var id = $(this).attr('id');
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
			$('.lienzo-dialog .desc').html(msg);
		},function() {
			$('.lienzo-dialog .desc').html('&nbsp;');
		});

		$('#createPdfBtn').click(function(e) {
			var pdf = new jsPDF({
				orientation: 'landscape',
			});
			pdf.text(20, 20, 'Tu terreno creado:');

			var frente = document.querySelector(".lienzoHtml").style.width;
			var fondo = document.querySelector(".lienzoHtml").style.height;

			console.log("frente: ", frente);
			console.log("fondo: ", fondo);
  			//pdf.addImage(imgData, 'JPEG', 0, 0);
			html2canvas(document.querySelector(".lienzoHtml")).then(canvas => {
			    //document.body.appendChild(canvas)
			    var imgData = canvas.toDataURL("image/jpeg", 1.0);
				console.log(imgData);
			    pdf.addImage(imgData, 'JPEG', 0, 30, parseInt(frente)/5, parseInt(fondo)/5);

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
	    $("#btnTool9").css('background',ctx.deleteMode?'#f44':'#fff');
	},
	setDeletableElement: function(ctx, elSelector) {
		//$(elSelector).click(function(e) {
	    $('body').on("click", "#canvasDiv2 div", function(e) {
	    	console.log('click');
	    	ctx.objSelected = $(this);
	    	$("#canvasDiv2 div").removeClass('OSel');
	    	$(this).addClass('OSel');
	    	if(ctx.deleteMode) {
	    		$(this).remove();
	    	}
	    	//elseif(ctx.rotateMode)
	    });
	},
	setToolboxEvents: function(ctx) {
		$('#btnTool1').click(function(e) {
			//ctx.drawCircularTable(ctx);
			ctx.toggleDropdown(ctx, 1);
		});
		$('#btnTool2').click(function(e) {
			//ctx.drawSquareTable(ctx);
			ctx.toggleDropdown(ctx, 2);
		});
		$('#btnTool3').click(function(e) {
			ctx.unToggleAllButton(ctx);
			ctx.drawLine(ctx);
		});
		$('#btnTool4').click(function(e) {
			//ctx.drawChair(ctx);
			ctx.toggleDropdown(ctx, 4);
		});
		$('#btnTool5').click(function(e) {
			ctx.unToggleAllButton(ctx);
			ctx.drawTree(ctx);
		});
		$('#btnTool7').click(function(e) {
			ctx.unToggleAllButton(ctx);
			ctx.clearCanvas(ctx);
		});
		$('#btnTool8').click(function(e) {
			ctx.unToggleAllButton(ctx);
			ctx.rotateObject(ctx);
		});
		$('#btnTool9').click(function(e) {
			ctx.unToggleAllButton(ctx);
			ctx.toggleDeletion(ctx);
		});

		$('#btnTool1A').click(function(e) {
			// $('#numW').val(5);
			// $('#numH').val(5);
			ctx.drawCircularTable(ctx);
		});
		$('#btnTool1B').click(function(e) {
			// $('#numW').val(2);
			// $('#numH').val(2);
			ctx.drawCircularTable(ctx);
		});
		$('#btnTool1C').click(function(e) {
			// $('#numW').val(3);
			// $('#numH').val(3);
			ctx.drawCircularTable(ctx);
		});
		$('#btnTool1D').click(function(e) {
			// $('#numW').val(.5);
			// $('#numH').val(.5);
			ctx.drawCircularTable(ctx);
		});
		$('#btnTool2A').click(function(e) {
			// $('#numW').val(1.5);
			// $('#numH').val(1.5);
			ctx.drawSquareTable(ctx);
		});
		$('#btnTool2B').click(function(e) {
			// $('#numW').val(2);
			// $('#numH').val(2);
			ctx.drawSquareTable(ctx);
		});
		$('#btnTool2C').click(function(e) {
			// $('#numW').val(3);
			// $('#numH').val(3);
			ctx.drawSquareTable(ctx);
		});
		$('#btnTool2D').click(function(e) {
			ctx.drawSquareTable(ctx);
		});
		$('#btnTool4A').click(function(e) {
			ctx.drawChair(ctx,2);
		});
		$('#btnTool4B').click(function(e) {
			ctx.drawChair(ctx,3);
		});
		$('#btnTool4C').click(function(e) {
			ctx.drawChair(ctx,4);
		});
		$('#btnTool4D').click(function(e) {
			ctx.drawChair(ctx,1);
		});
		$("#buscarItem").click(function(){
			var inputIdProduct = $("#idProduct").val();
			var host = 'http://ec2-13-58-120-128.us-east-2.compute.amazonaws.com/';

			if(inputIdProduct !== ''){
				console.log("se ha hecho click", inputIdProduct);
				var product = products.filter(function(item){
					return item.id === inputIdProduct
				});

				if(Array.isArray(product) && product.length > 0){
					console.log("product", product);
					$("#product-name").html(product[0].name);
					$("#product-id").html(product[0].id);
					$("#product-img").attr({"src" : host + product[0].url});

					var W = product[0].size.split("X")[0];
					var H = product[0].size.split("X")[1];

					$('#numW').val(W);
					$('#numH').val(H);
					$('#id_element').val(product[0].id);
					$('#type_element').val(product[0].type);

					switch(product[0].type){
						case'Mesas':
							if(product[0].name.indexOf("REDONDA") != -1) {
								$('#numW').val(W);
								$('#numH').val(W);
								$('#btnTool1A').click();
							}
							else  $('#btnTool2A').click();
							break;
						case'Sillas':
							$('#btnTool4D').click();
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
		$("#addQuotation").click(function(){
			// sillas="[{id:1, qty: 5}]"&mesas=[{id:4, qty: 9}, {id: 78, qty; 4}]
			console.log("agregar a cotización --------------------");
			var k = $("#kanvas").siblings();
			console.log(k);
			[...k].map(function(item){
				console.log(item);
			});
		});
	},
	toggleDropdown: function(ctx, id) {
		
		var sel2 = '#btnTool' + id;
		var sel = sel2 + ' span';
		var d = $(sel).data('tg');

		ctx.unToggleAllButton(ctx);
		
		if( d ) {
			$(sel).hide();
			$(sel2).removeClass('toggled');
			$(sel).data('tg', false);
		}
		else {
			$(sel).show();
			$(sel2).addClass('toggled');
			$(sel).data('tg', true);
		}
		
	},
	unToggleAllButton: function(ctx) {
		var sel3 = '.tool.toggled';
		$(sel3+ ' .dd').hide();
		$(sel3+' span').data('tg', false);
		$(sel3).removeClass('toggled');
	},
	clearCanvas: function(ctx) {
		//var txt;
		var r = confirm("Se borrara completamente el diseno, esta operacion es irreversible, ¿desea continuar?.");
		if (r == true) {
		    //txt = "You pressed OK!";
		    $('#canvasDiv2 div').remove();
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
		//$('#'+prefix+'-'+ctx.objId).draggable({
		$('#'+id).draggable({
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
    	var w = $('#numW').val()*ctx.scale;
		var h = $('#numH').val()*ctx.scale;
		var id = $('#id_element').val();
		var type = $('#type_element').val();

    	var style = 'style="width:'+w+'px; height:'+h+'px;"';
    	ctx.c.append('<div id="osq-'+ctx.objId+'" class="OSQ1" '+style+' data-element="'+ id +'-'+ type +'" ></div>');
    	ctx.addDraggable(ctx,'osq-'+ctx.objId+'');
    	$('#osq-'+ctx.objId).width(w*ctx.ratio);
		$('#osq-'+ctx.objId).height(h*ctx.ratio);
    	ctx.objId++;
	},
	drawCircularTable: function(ctx) {

		console.log( $('#numW').val() + ' ' + $('#numH').val() );
		var w = $('#numW').val()*ctx.scale;
    	var h = $('#numH').val()*ctx.scale;
		var r = $('#numW').val()*ctx.scale/.5;
		var id = $('#id_element').val();
		var type = $('#type_element').val();

    	var style = 'style="width:'+w+'px; height:'+h+'px; border-radius:'+r+'px;"';
    	ctx.c.append('<div id="ocl-'+ctx.objId+'" class="OCL1" '+style+' data-element="'+ id +'-'+ type +'" ></div>');
    	ctx.addDraggable(ctx,'ocl-'+ctx.objId+'');
    	$('#ocl-'+ctx.objId).width(w*ctx.ratio); // (80*ctx.ratio
		$('#ocl-'+ctx.objId).height(h*ctx.ratio);
    	ctx.objId++;
	},
	drawChair: function(ctx, typeId) {
		var id = $('#id_element').val();
		var type = $('#type_element').val();
		ctx.c.append('<div id="och-'+ctx.objId+'" class="OCH'+typeId+'" data-element="'+ id +'-'+ type +'" ></div>');
		ctx.addDraggable(ctx,'och-'+ctx.objId+'');
		var w = 42, h = 42;
		if(typeId == 2) {
			w = 54;
		}
		else if(typeId == 3) {
			w = 45;
			h = 43;
		}
		else if(typeId == 4) {
			w = 34;
			h = 40;
		}
		
		$('#och-'+ctx.objId).width(w*ctx.ratio); // // 42*ctx.ratio
		$('#och-'+ctx.objId).height(h*ctx.ratio);
		ctx.objId++;
	},
	drawTree: function(ctx) {
		ctx.c.append('<div id="otr-'+ctx.objId+'" class="OTR1"></div>');
		ctx.addDraggable(ctx,'otr-'+ctx.objId+'');
		$('#otr-'+ctx.objId).width(80*ctx.ratio);
		$('#otr-'+ctx.objId).height(80*ctx.ratio);
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
		$('#'+lineObj.pfin).css('top','200px');
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
        var el1pos = $('#'+lineObj.pini).position();
        var el2pos = $('#'+lineObj.pfin).position();
        console.log(el1pos);
        console.log(el2pos);
        var fs = 1;
        ctx.canvasCtx.moveTo(el1pos.left/fs+ctx.sqlnsz/2, el1pos.top/fs+ctx.sqlnsz/2);
        ctx.canvasCtx.lineTo(el2pos.left/fs+ctx.sqlnsz/2, el2pos.top/fs+ctx.sqlnsz/2);
        ctx.canvasCtx.stroke();
	}
};

var CoreTerrenoAppInstance = null;

$(function() {
	CoreTerrenoAppInstance = new CoreTerrenoApp();
});