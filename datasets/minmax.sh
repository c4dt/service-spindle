#!/bin/zsh

# This is a very handwavy script to allow to convert the user input values as coming
# from the measurements to the values used in the nodes to train.

USER_CSVS="1 2 3"
TRAIN_CSVS="1_node 2_node 3_node"

calc(){
#  echo $(( $1 * $3 + $2 - $4 )) :: $3
  local A=$1
  local B=$2
  local user=$3
  local train=$4
  echo "For user = $user, diff = $(( A * user + B - train ))"
#  echo "For user = $user, train = $(( A * user + B )) and should be $train"
}

echo "Formula is: a * user + b"
for col in $(seq 8); do
  USER_MIN=$( tail -q -n +2 ${=USER_CSVS} | csvtool -c $col | sort -un | head -n 1 )
  USER_MAX=$( tail -q -n +2 ${=USER_CSVS} | csvtool -c $col | sort -un | tail -n 1 )
  TRAIN_MIN=$( cat ${=TRAIN_CSVS} | csvtool -c $(( col + 1 )) | sort -un | head -n 1 )
  TRAIN_MAX=$( cat ${=TRAIN_CSVS} | csvtool -c $(( col + 1 )) | sort -un | tail -n 1 )
  A=$(( ( TRAIN_MIN - TRAIN_MAX ) / ( USER_MIN - USER_MAX ) ))
  B=$(( TRAIN_MIN - A * USER_MIN ))
#  echo "User is from $USER_MIN..$USER_MAX"
#  echo "Train is from $TRAIN_MIN..$TRAIN_MAX"
  echo "[ $A, $B ],"
#  calc $A $B $(( ( USER_MIN + USER_MAX ) / 2.0 )) $(( ( TRAIN_MIN + TRAIN_MAX ) / 2.0 ))
#  echo "[ $USER_MIN,  $(( USER_MAX - USER_MIN ))," \
#    "$(( TRAIN_MAX - TRAIN_MIN)), $TRAIN_MIN ],"
#  echo "$col: (user - $USER_MIN) / $(( USER_MAX - USER_MIN )) * " \
#    "$(( TRAIN_MAX - TRAIN_MIN)) + $TRAIN_MIN"
done