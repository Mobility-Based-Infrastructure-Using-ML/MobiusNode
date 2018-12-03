var data;
// GET THE DATA
// loss
// training time
// webcame information ?

// updates server file

export function update(info){
  // creating object
  data = {
    loss: info.loss,
    train: info.train
  }

  // write data
  console.log(data);
}