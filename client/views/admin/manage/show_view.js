Template.show_view.helpers({
  log: function(o){
    console.log(o)
  },
  get: function(wrapper){
    var entity = wrapper.hash
    var obj = entity.obj || {}
    var prop = entity.prop
    return obj[prop] || null
  }
})